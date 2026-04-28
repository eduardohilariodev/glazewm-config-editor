use crate::error::AppResult;

/// Validate a regex pattern using the same `regex` crate that GlazeWM uses,
/// so anything we accept here is guaranteed to compile in the WM.
pub fn validate_regex(pattern: &str) -> AppResult<()> {
    regex::Regex::new(pattern)?;
    Ok(())
}
