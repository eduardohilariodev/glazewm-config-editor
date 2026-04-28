# dev.ps1 — Launch `tauri dev` with the MSVC + cargo environment fully loaded.
# Use this from any PowerShell prompt instead of `deno task tauri dev` if your
# shell was started before Rust/VS Build Tools were installed.

$ErrorActionPreference = "Stop"

# 1. Kill any running app instances and other dev.ps1 sessions
Get-Process -Name "glazewm-config-editor" -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.Id -Force }

Get-CimInstance Win32_Process -Filter "Name = 'pwsh.exe' OR Name = 'powershell.exe'" |
    Where-Object { $_.CommandLine -like "*dev.ps1*" -and $_.ProcessId -ne $PID } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

# 2. Make sure cargo and deno are on PATH (User PATH may not be in current session)
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$env:Path = "$userPath;$machinePath;$env:Path"

# 3. Load the MSVC environment (link.exe, cl.exe, Windows SDK)
$vsDevShell = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\Launch-VsDevShell.ps1"
if (-not (Test-Path $vsDevShell)) {
    Write-Error "VS Build Tools not found at $vsDevShell. Install with:`n  winget install Microsoft.VisualStudio.2022.BuildTools --override `"--wait --passive --add Microsoft.VisualStudio.Workload.VCTools`""
    exit 1
}
& $vsDevShell -Arch amd64 -HostArch amd64 -SkipAutomaticLocation | Out-Null

# 4. Resolve deno by full path to avoid stale command-lookup cache
$deno = (Get-Command deno -ErrorAction SilentlyContinue)?.Source
if (-not $deno) {
    Write-Error "deno not found on PATH. Install deno and try again: https://deno.com"
    exit 1
}

# 5. Run from the repo root (parent of scripts/)
Set-Location -Path (Split-Path $PSScriptRoot -Parent)

# 6. Forward args (default: dev)
if ($args.Count -gt 0) {
    & $deno task tauri @args
} else {
    & $deno task tauri dev
}
