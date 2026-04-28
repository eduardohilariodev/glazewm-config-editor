use std::process::Command;

use crate::error::AppResult;

/// Opens `path` with the OS default application (Windows only).
pub fn open_with_default(path: &str) -> AppResult<()> {
    Command::new("cmd")
        .args(["/c", "start", "", path])
        .spawn()?;
    Ok(())
}

/// Opens Windows Explorer with `path` selected.
pub fn reveal_in_explorer(path: &str) -> AppResult<()> {
    Command::new("explorer.exe")
        .arg(format!("/select,{}", path))
        .spawn()?;
    Ok(())
}
