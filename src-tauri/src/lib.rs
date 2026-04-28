mod commands;
mod error;
mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::config::read_config,
            commands::config::write_config,
            commands::config::default_config_path,
            commands::config::path_exists,
            commands::config::validate_regex,
            commands::config::reload_glazewm,
            commands::config::get_mtime,
            commands::window_picker::start_window_pick,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
