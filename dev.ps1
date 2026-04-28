# dev.ps1 — Launch `tauri dev` with the MSVC + cargo environment fully loaded.
# Use this from any PowerShell prompt instead of `deno task tauri dev` if your
# shell was started before Rust/VS Build Tools were installed.

$ErrorActionPreference = "Stop"

# 1. Make sure cargo and deno are on PATH (User PATH may not be in current session)
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$env:Path = "$userPath;$machinePath;$env:Path"

# 2. Load the MSVC environment (link.exe, cl.exe, Windows SDK)
$vsDevShell = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\Launch-VsDevShell.ps1"
if (-not (Test-Path $vsDevShell)) {
    Write-Error "VS Build Tools not found at $vsDevShell. Install with:`n  winget install Microsoft.VisualStudio.2022.BuildTools --override `"--wait --passive --add Microsoft.VisualStudio.Workload.VCTools`""
    exit 1
}
& $vsDevShell -Arch amd64 -HostArch amd64 -SkipAutomaticLocation | Out-Null

# 3. Run from this script's directory
Set-Location -Path $PSScriptRoot

# 4. Forward args (default: dev)
if ($args.Count -gt 0) {
    & deno task tauri @args
} else {
    & deno task tauri dev
}
