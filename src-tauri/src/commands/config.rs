use crate::services;

#[tauri::command]
pub fn read_config(path: String) -> Result<String, String> {
    services::config::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_config(path: String, content: String) -> Result<(), String> {
    services::config::write(&path, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_mtime(path: String) -> Result<u128, String> {
    services::config::mtime_millis(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn default_config_path() -> Result<String, String> {
    services::config::default_path().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn path_exists(path: String) -> bool {
    services::config::exists(&path)
}

#[tauri::command]
pub fn validate_regex(pattern: String) -> Result<(), String> {
    services::validation::validate_regex(&pattern).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn reload_glazewm() -> Result<String, String> {
    services::process::reload_glazewm().map_err(|e| e.to_string())
}
