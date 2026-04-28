use std::fs;
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use crate::error::{AppError, AppResult};

pub fn read(path: &str) -> AppResult<String> {
    Ok(fs::read_to_string(path)?)
}

/// Atomic write: write to `<path>.tmp`, then rename — prevents config
/// corruption if the process is killed mid-write.
pub fn write(path: &str, content: &str) -> AppResult<()> {
    let dest = PathBuf::from(path);
    let tmp = dest.with_extension("yaml.tmp");
    fs::write(&tmp, content)?;
    fs::rename(&tmp, &dest)?;
    Ok(())
}

/// Last-modified timestamp in milliseconds since the Unix epoch. Returns
/// `Ok(0)` when the file does not exist (caller treats absence as "never
/// modified" rather than as an error).
pub fn mtime_millis(path: &str) -> AppResult<u128> {
    let p = Path::new(path);
    if !p.exists() {
        return Ok(0);
    }
    let modified = fs::metadata(p)?.modified()?;
    Ok(modified.duration_since(UNIX_EPOCH)?.as_millis())
}

pub fn default_path() -> AppResult<String> {
    let home =
        std::env::var("USERPROFILE").map_err(|_| AppError::MissingEnv("USERPROFILE".into()))?;
    Ok(format!("{}\\.glzr\\glazewm\\config.yaml", home))
}

pub fn exists(path: &str) -> bool {
    Path::new(path).exists()
}
