use thiserror::Error;

/// Centralized application error type. Commands map this to `String` at the
/// FFI boundary because Tauri requires command errors to be serializable.
#[derive(Debug, Error)]
pub enum AppError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("invalid regex: {0}")]
    Regex(#[from] regex::Error),

    #[error("system time error: {0}")]
    Time(#[from] std::time::SystemTimeError),

    #[error("environment variable {0} is not set")]
    MissingEnv(String),

    #[error("glazewm CLI error: {0}")]
    GlazeWm(String),

    #[error("{0}")]
    #[allow(dead_code)]
    Other(String),
}

impl From<std::env::VarError> for AppError {
    fn from(_: std::env::VarError) -> Self {
        AppError::MissingEnv("USERPROFILE".into())
    }
}

pub type AppResult<T> = Result<T, AppError>;
