use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::time::UNIX_EPOCH;

#[tauri::command]
pub fn read_config(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn write_config(path: String, content: String) -> Result<(), String> {
    // Atomic write: .tmp first, then rename — prevents config corruption on crash
    let dest = PathBuf::from(&path);
    let tmp = dest.with_extension("yaml.tmp");
    fs::write(&tmp, &content).map_err(|e| e.to_string())?;
    fs::rename(&tmp, &dest).map_err(|e| e.to_string())
}

/// Returns the file's last-modified timestamp in milliseconds since the Unix
/// epoch. Used to detect external edits (e.g. user opens the YAML in another
/// editor and saves it). Returns 0 if the file does not exist.
#[tauri::command]
pub fn get_mtime(path: String) -> Result<u128, String> {
    let p = PathBuf::from(&path);
    if !p.exists() {
        return Ok(0);
    }
    let meta = fs::metadata(&p).map_err(|e| e.to_string())?;
    let modified = meta.modified().map_err(|e| e.to_string())?;
    let ms = modified
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis();
    Ok(ms)
}

#[tauri::command]
pub fn default_config_path() -> Result<String, String> {
    let home = std::env::var("USERPROFILE").map_err(|e| e.to_string())?;
    Ok(format!("{}\\.glzr\\glazewm\\config.yaml", home))
}

#[tauri::command]
pub fn path_exists(path: String) -> bool {
    PathBuf::from(&path).exists()
}

/// Validate a regex pattern using the same `regex` crate that GlazeWM uses,
/// so anything we accept here is guaranteed to compile in the WM. Returns
/// `Ok(())` on success, `Err(<message>)` on failure.
#[tauri::command]
pub fn validate_regex(pattern: String) -> Result<(), String> {
    regex::Regex::new(&pattern)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

/// Asks a running GlazeWM instance to reload its config via the bundled CLI:
///   glazewm command wm-reload-config
/// GlazeWM must already be running; if not, returns the underlying error.
#[tauri::command]
pub fn reload_glazewm() -> Result<String, String> {
    let output = Command::new("glazewm")
        .args(["command", "wm-reload-config"])
        .output()
        .map_err(|e| {
            format!(
                "could not invoke `glazewm` (is GlazeWM installed and on PATH?): {}",
                e
            )
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(format!(
            "glazewm exited with {}: {}{}",
            output.status,
            stdout.trim(),
            stderr.trim()
        ));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
