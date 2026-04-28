use crate::services;

#[tauri::command]
pub fn open_with_default(path: String) -> Result<(), String> {
    services::shell::open_with_default(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reveal_in_explorer(path: String) -> Result<(), String> {
    services::shell::reveal_in_explorer(&path).map_err(|e| e.to_string())
}
