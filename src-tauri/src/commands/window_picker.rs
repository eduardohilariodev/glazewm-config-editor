// Window picker — pick a window with the mouse and extract its process name,
// class name, and title for use in window rules. Windows-only by design.

#[cfg(windows)]
mod imp {
    use std::path::PathBuf;
    use std::sync::Mutex;
    use std::sync::OnceLock;

    use serde::Serialize;
    use tauri::{AppHandle, Emitter};

    use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM, LRESULT, WPARAM};
    use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
    use windows::Win32::System::Threading::{
        GetCurrentProcessId, OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, DispatchMessageW, GetClassNameW, GetMessageW, GetWindowTextW,
        GetWindowThreadProcessId, PostQuitMessage, SetWindowsHookExW, TranslateMessage,
        UnhookWindowsHookEx, WindowFromPoint, HHOOK, MSG, MSLLHOOKSTRUCT, WH_MOUSE_LL,
        WM_LBUTTONUP, WM_RBUTTONUP,
    };

    #[derive(Serialize, Clone)]
    pub struct WindowInfo {
        pub process: String,
        pub class_name: String,
        pub title: String,
        pub cancelled: bool,
    }

    struct PickerState {
        app: AppHandle,
        hook: isize,
    }

    static STATE: OnceLock<Mutex<Option<PickerState>>> = OnceLock::new();
    static ACTIVE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

    fn state() -> &'static Mutex<Option<PickerState>> {
        STATE.get_or_init(|| Mutex::new(None))
    }

    unsafe extern "system" fn mouse_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code < 0 {
            return unsafe { CallNextHookEx(None, code, wparam, lparam) };
        }

        let msg = wparam.0 as u32;
        if msg != WM_LBUTTONUP && msg != WM_RBUTTONUP {
            return unsafe { CallNextHookEx(None, code, wparam, lparam) };
        }

        let info = unsafe { *(lparam.0 as *const MSLLHOOKSTRUCT) };
        let pt = info.pt;
        let cancelled = msg == WM_RBUTTONUP;

        let payload = if cancelled {
            WindowInfo {
                process: String::new(),
                class_name: String::new(),
                title: String::new(),
                cancelled: true,
            }
        } else {
            let hwnd = unsafe { WindowFromPoint(pt) };

            // Skip our own window — the user is still aiming.
            let mut pid: u32 = 0;
            unsafe { GetWindowThreadProcessId(hwnd, Some(&mut pid)) };
            if pid == 0 || pid == unsafe { GetCurrentProcessId() } {
                return unsafe { CallNextHookEx(None, code, wparam, lparam) };
            }

            extract_info(hwnd, pid)
        };

        // Stop the hook + emit on the picker thread.
        if let Ok(mut guard) = state().lock() {
            if let Some(s) = guard.take() {
                let _ = s.app.emit("window-picked", &payload);
                if s.hook != 0 {
                    let _ = unsafe { UnhookWindowsHookEx(HHOOK(s.hook as *mut _)) };
                }
            }
        }
        ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
        unsafe { PostQuitMessage(0) };

        // Swallow the click that completed the pick — don't pass it to the app
        // under the cursor (which would otherwise activate it).
        LRESULT(1)
    }

    fn extract_info(hwnd: HWND, pid: u32) -> WindowInfo {
        let mut class_buf = [0u16; 256];
        let class_len = unsafe { GetClassNameW(hwnd, &mut class_buf) };
        let class_name = String::from_utf16_lossy(&class_buf[..class_len.max(0) as usize]);

        let mut title_buf = [0u16; 512];
        let title_len = unsafe { GetWindowTextW(hwnd, &mut title_buf) };
        let title = String::from_utf16_lossy(&title_buf[..title_len.max(0) as usize]);

        let process = unsafe {
            match OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
                Ok(handle) => {
                    let mut buf = [0u16; 1024];
                    let len = GetModuleFileNameExW(Some(handle), None, &mut buf);
                    let _ = CloseHandle(handle);
                    if len > 0 {
                        let full = String::from_utf16_lossy(&buf[..len as usize]);
                        PathBuf::from(&full)
                            .file_name()
                            .map(|n| n.to_string_lossy().into_owned())
                            .unwrap_or(full)
                    } else {
                        String::new()
                    }
                }
                Err(_) => String::new(),
            }
        };

        WindowInfo {
            process,
            class_name,
            title,
            cancelled: false,
        }
    }

    pub fn start(app: AppHandle) -> Result<(), String> {
        if ACTIVE.swap(true, std::sync::atomic::Ordering::SeqCst) {
            return Err("window picker already active".into());
        }

        std::thread::spawn(move || {
            let hook = unsafe { SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_proc), None, 0) };
            let hhook = match hook {
                Ok(h) => h,
                Err(e) => {
                    ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
                    let _ = app.emit(
                        "window-picked",
                        WindowInfo {
                            process: String::new(),
                            class_name: String::new(),
                            title: String::new(),
                            cancelled: true,
                        },
                    );
                    eprintln!("SetWindowsHookExW failed: {e}");
                    return;
                }
            };

            if let Ok(mut guard) = state().lock() {
                *guard = Some(PickerState {
                    app: app.clone(),
                    hook: hhook.0 as isize,
                });
            }

            // Required: low-level hooks fire on the thread that installed them
            // and only while that thread pumps messages.
            let mut msg = MSG::default();
            unsafe {
                while GetMessageW(&mut msg, None, 0, 0).as_bool() {
                    let _ = TranslateMessage(&msg);
                    DispatchMessageW(&msg);
                }
            }

            // Safety net if the loop exits without the callback unhooking.
            if let Ok(mut guard) = state().lock() {
                if let Some(s) = guard.take() {
                    if s.hook != 0 {
                        let _ = unsafe { UnhookWindowsHookEx(HHOOK(s.hook as *mut _)) };
                    }
                }
            }
            ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
        });

        Ok(())
    }
}

#[cfg(windows)]
#[tauri::command]
pub async fn start_window_pick(app: tauri::AppHandle) -> Result<(), String> {
    imp::start(app)
}

#[cfg(not(windows))]
#[tauri::command]
pub async fn start_window_pick(_app: tauri::AppHandle) -> Result<(), String> {
    Err("window picker is only supported on Windows".into())
}
