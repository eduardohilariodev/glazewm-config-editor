// Window picker — pick a window with the mouse and extract its process name,
// class name, and title for use in window rules. Windows-only by design.
//
// Architecture:
//   * A low-level mouse hook (WH_MOUSE_LL) runs on a dedicated thread that
//     pumps a Win32 message loop (required by the OS for global hooks).
//   * On WM_MOUSEMOVE we re-query the window under the cursor (throttled) and
//     emit `picker-hover` to the `picker-overlay` window which renders a
//     tooltip following the cursor.
//   * On WM_LBUTTONDOWN we emit `window-picked` to the main window, hide the
//     overlay, unhook, and quit the message loop. We return LRESULT(1) so the
//     committing click is swallowed instead of activating the target.
//   * Right-click cancels.

#[cfg(windows)]
mod imp {
    use std::cell::Cell;
    use std::path::PathBuf;
    use std::sync::Mutex;
    use std::sync::OnceLock;
    use std::time::Instant;

    use serde::Serialize;
    use tauri::{AppHandle, Emitter, Manager, PhysicalPosition, PhysicalSize};

    use windows::Win32::Foundation::{CloseHandle, HWND, LPARAM, LRESULT, WPARAM};
    use windows::Win32::System::Threading::{
        GetCurrentProcessId, OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, DispatchMessageW, GetClassNameW, GetMessageW, GetSystemMetrics,
        GetWindowTextW, GetWindowThreadProcessId, PostQuitMessage, SetWindowsHookExW,
        TranslateMessage, UnhookWindowsHookEx, WindowFromPoint, HHOOK, MSG, MSLLHOOKSTRUCT,
        SM_CXVIRTUALSCREEN, SM_CYVIRTUALSCREEN, SM_XVIRTUALSCREEN, SM_YVIRTUALSCREEN, WH_MOUSE_LL,
        WM_LBUTTONDOWN, WM_MOUSEMOVE, WM_RBUTTONDOWN,
    };

    const OVERLAY_LABEL: &str = "picker-overlay";

    // Throttle thresholds for hover re-queries.
    const HOVER_THROTTLE_MS: u128 = 50;
    const HOVER_THROTTLE_PX: i32 = 4;

    #[derive(Serialize, Clone)]
    pub struct WindowInfo {
        pub process: String,
        pub class_name: String,
        pub title: String,
        /// True when the resolved process is `ApplicationFrameHost` — the UWP
        /// host. The real app's PID lives on a child window, so the value of
        /// `process` is the host, not the app. The UI should warn the user to
        /// match by `window_class` (or `window_title`) instead.
        pub is_uwp_host: bool,
        pub cancelled: bool,
    }

    #[derive(Serialize, Clone)]
    struct HoverPayload {
        x: i32,
        y: i32,
        process: String,
        class_name: String,
        title: String,
        is_uwp_host: bool,
        focus: String,
    }

    struct PickerState {
        app: AppHandle,
        hook: isize,
        focus: String,
    }

    static STATE: OnceLock<Mutex<Option<PickerState>>> = OnceLock::new();
    static ACTIVE: std::sync::atomic::AtomicBool = std::sync::atomic::AtomicBool::new(false);

    // Throttle counters live on the picker thread (the hook callback runs there).
    thread_local! {
        static LAST_HOVER: Cell<Option<(Instant, i32, i32)>> = const { Cell::new(None) };
        static LAST_HWND: Cell<isize> = const { Cell::new(0) };
    }

    fn state() -> &'static Mutex<Option<PickerState>> {
        STATE.get_or_init(|| Mutex::new(None))
    }

    fn with_state<F: FnOnce(&AppHandle, &str)>(f: F) {
        if let Ok(guard) = state().lock() {
            if let Some(s) = guard.as_ref() {
                f(&s.app, &s.focus);
            }
        }
    }

    fn show_overlay(app: &AppHandle) {
        let Some(w) = app.get_webview_window(OVERLAY_LABEL) else {
            return;
        };
        // Cover the entire virtual screen (handles multi-monitor).
        unsafe {
            let x = GetSystemMetrics(SM_XVIRTUALSCREEN);
            let y = GetSystemMetrics(SM_YVIRTUALSCREEN);
            let cx = GetSystemMetrics(SM_CXVIRTUALSCREEN).max(0) as u32;
            let cy = GetSystemMetrics(SM_CYVIRTUALSCREEN).max(0) as u32;
            let _ = w.set_position(PhysicalPosition::new(x, y));
            let _ = w.set_size(PhysicalSize::new(cx, cy));
        }
        let _ = w.set_ignore_cursor_events(true);
        let _ = w.show();
        let _ = w.set_always_on_top(true);
    }

    fn hide_overlay(app: &AppHandle) {
        if let Some(w) = app.get_webview_window(OVERLAY_LABEL) {
            let _ = app.emit_to(OVERLAY_LABEL, "picker-hide", ());
            let _ = w.hide();
        }
    }

    unsafe extern "system" fn mouse_proc(code: i32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
        if code < 0 {
            return unsafe { CallNextHookEx(None, code, wparam, lparam) };
        }

        let msg = wparam.0 as u32;
        let hook_info = unsafe { *(lparam.0 as *const MSLLHOOKSTRUCT) };
        let pt = hook_info.pt;

        match msg {
            WM_MOUSEMOVE => {
                // Throttle: skip if cursor barely moved or last emit was recent.
                let should_emit = LAST_HOVER.with(|c| {
                    let now = Instant::now();
                    match c.get() {
                        Some((t, lx, ly)) => {
                            let elapsed = now.duration_since(t).as_millis();
                            let dx = (pt.x - lx).abs();
                            let dy = (pt.y - ly).abs();
                            if elapsed >= HOVER_THROTTLE_MS
                                || dx >= HOVER_THROTTLE_PX
                                || dy >= HOVER_THROTTLE_PX
                            {
                                c.set(Some((now, pt.x, pt.y)));
                                true
                            } else {
                                false
                            }
                        }
                        None => {
                            c.set(Some((now, pt.x, pt.y)));
                            true
                        }
                    }
                });
                if should_emit {
                    let hwnd = unsafe { WindowFromPoint(pt) };
                    let mut pid: u32 = 0;
                    unsafe { GetWindowThreadProcessId(hwnd, Some(&mut pid)) };
                    let own_pid = unsafe { GetCurrentProcessId() };
                    let info = if pid == 0 || pid == own_pid {
                        // Hovering our own UI — clear the tooltip details but
                        // still update position so it tracks the cursor.
                        WindowInfo {
                            process: String::new(),
                            class_name: String::new(),
                            title: String::new(),
                            is_uwp_host: false,
                            cancelled: false,
                        }
                    } else {
                        // Avoid the expensive process-name lookup if the HWND
                        // hasn't changed since the last hover.
                        let prev_hwnd = LAST_HWND.with(|c| c.get());
                        let curr_hwnd = hwnd.0 as isize;
                        if curr_hwnd == prev_hwnd {
                            cheap_info(hwnd)
                        } else {
                            LAST_HWND.with(|c| c.set(curr_hwnd));
                            extract_info(hwnd, pid)
                        }
                    };
                    with_state(|app, focus| {
                        let _ = app.emit_to(
                            OVERLAY_LABEL,
                            "picker-hover",
                            HoverPayload {
                                x: pt.x,
                                y: pt.y,
                                process: info.process,
                                class_name: info.class_name,
                                title: info.title,
                                is_uwp_host: info.is_uwp_host,
                                focus: focus.to_string(),
                            },
                        );
                    });
                }
            }
            WM_LBUTTONDOWN => {
                let hwnd = unsafe { WindowFromPoint(pt) };
                let mut pid: u32 = 0;
                unsafe { GetWindowThreadProcessId(hwnd, Some(&mut pid)) };
                if pid == 0 || pid == unsafe { GetCurrentProcessId() } {
                    // Click on our own UI — let it through, keep aiming.
                    return unsafe { CallNextHookEx(None, code, wparam, lparam) };
                }
                let payload = extract_info(hwnd, pid);
                finalize(Some(payload));
                // Swallow the click so it doesn't activate the target.
                return LRESULT(1);
            }
            WM_RBUTTONDOWN => {
                finalize(None);
                return LRESULT(1);
            }
            _ => {}
        }

        unsafe { CallNextHookEx(None, code, wparam, lparam) }
    }

    fn finalize(payload: Option<WindowInfo>) {
        let final_payload = payload.unwrap_or(WindowInfo {
            process: String::new(),
            class_name: String::new(),
            title: String::new(),
            is_uwp_host: false,
            cancelled: true,
        });
        if let Ok(mut guard) = state().lock() {
            if let Some(s) = guard.take() {
                hide_overlay(&s.app);
                let _ = s.app.emit("window-picked", &final_payload);
                if s.hook != 0 {
                    let _ = unsafe { UnhookWindowsHookEx(HHOOK(s.hook as *mut _)) };
                }
            }
        }
        ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
        unsafe { PostQuitMessage(0) };
    }

    /// Cheap hover info that skips the process-name lookup. Used when the
    /// HWND under the cursor hasn't changed since the last hover emit.
    fn cheap_info(hwnd: HWND) -> WindowInfo {
        let mut class_buf = [0u16; 256];
        let class_len = unsafe { GetClassNameW(hwnd, &mut class_buf) };
        let class_name = String::from_utf16_lossy(&class_buf[..class_len.max(0) as usize]);

        let mut title_buf = [0u16; 512];
        let title_len = unsafe { GetWindowTextW(hwnd, &mut title_buf) };
        let title = String::from_utf16_lossy(&title_buf[..title_len.max(0) as usize]);

        WindowInfo {
            process: String::new(),
            class_name,
            title,
            is_uwp_host: false,
            cancelled: false,
        }
    }

    fn extract_info(hwnd: HWND, pid: u32) -> WindowInfo {
        let mut class_buf = [0u16; 256];
        let class_len = unsafe { GetClassNameW(hwnd, &mut class_buf) };
        let class_name = String::from_utf16_lossy(&class_buf[..class_len.max(0) as usize]);

        let mut title_buf = [0u16; 512];
        let title_len = unsafe { GetWindowTextW(hwnd, &mut title_buf) };
        let title = String::from_utf16_lossy(&title_buf[..title_len.max(0) as usize]);

        // Use QueryFullProcessImageNameW with PROCESS_QUERY_LIMITED_INFORMATION
        // — works against elevated processes and Store apps where the older
        // GetModuleFileNameExW + PROCESS_QUERY_INFORMATION|PROCESS_VM_READ
        // combo silently fails (returns 0 / empty string).
        let process = unsafe {
            match OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) {
                Ok(handle) => {
                    let mut buf = [0u16; 1024];
                    let mut size: u32 = buf.len() as u32;
                    let ok = QueryFullProcessImageNameW(
                        handle,
                        PROCESS_NAME_FORMAT(0),
                        windows::core::PWSTR(buf.as_mut_ptr()),
                        &mut size,
                    );
                    let _ = CloseHandle(handle);
                    if ok.is_ok() && size > 0 {
                        let full = String::from_utf16_lossy(&buf[..size as usize]);
                        // GlazeWM's `window_process` matcher expects the bare
                        // executable name without `.exe` (e.g. "chrome", not
                        // "chrome.exe" and not the full path).
                        PathBuf::from(&full)
                            .file_stem()
                            .map(|n| n.to_string_lossy().into_owned())
                            .unwrap_or(full)
                    } else {
                        String::new()
                    }
                }
                Err(_) => String::new(),
            }
        };

        let is_uwp_host = process.eq_ignore_ascii_case("ApplicationFrameHost");

        WindowInfo {
            process,
            class_name,
            title,
            is_uwp_host,
            cancelled: false,
        }
    }

    pub fn start(app: AppHandle, focus: String) -> Result<(), String> {
        if ACTIVE.swap(true, std::sync::atomic::Ordering::SeqCst) {
            return Err("window picker already active".into());
        }

        // Show the overlay before installing the hook so the very first hover
        // event has something to render into.
        show_overlay(&app);

        std::thread::spawn(move || {
            // Reset throttle state for this picking session.
            LAST_HOVER.with(|c| c.set(None));
            LAST_HWND.with(|c| c.set(0));

            let hook = unsafe { SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_proc), None, 0) };
            let hhook = match hook {
                Ok(h) => h,
                Err(e) => {
                    ACTIVE.store(false, std::sync::atomic::Ordering::SeqCst);
                    hide_overlay(&app);
                    let _ = app.emit(
                        "window-picked",
                        WindowInfo {
                            process: String::new(),
                            class_name: String::new(),
                            title: String::new(),
                            is_uwp_host: false,
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
                    focus: focus.clone(),
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

            // Safety net if the loop exits without the callback finalizing.
            if let Ok(mut guard) = state().lock() {
                if let Some(s) = guard.take() {
                    hide_overlay(&s.app);
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
pub async fn start_window_pick(app: tauri::AppHandle, focus: Option<String>) -> Result<(), String> {
    imp::start(app, focus.unwrap_or_default())
}

#[cfg(not(windows))]
#[tauri::command]
pub async fn start_window_pick(
    _app: tauri::AppHandle,
    _focus: Option<String>,
) -> Result<(), String> {
    Err("window picker is only supported on Windows".into())
}
