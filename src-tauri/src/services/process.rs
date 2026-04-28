use std::process::Command;

use crate::error::{AppError, AppResult};

/// Asks a running GlazeWM instance to reload its config via the bundled CLI:
///   glazewm command wm-reload-config
/// GlazeWM must already be running; if not, returns the underlying error.
pub fn reload_glazewm() -> AppResult<String> {
    let output = Command::new("glazewm")
        .args(["command", "wm-reload-config"])
        .output()
        .map_err(|e| {
            AppError::GlazeWm(format!(
                "could not invoke `glazewm` (is GlazeWM installed and on PATH?): {}",
                e
            ))
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        return Err(AppError::GlazeWm(format!(
            "glazewm exited with {}: {}{}",
            output.status,
            stdout.trim(),
            stderr.trim()
        )));
    }

    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}
