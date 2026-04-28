# build.ps1 — Produce a release .exe (and MSI/NSIS installers) for GlazeWM Editor.
# Loads cargo + MSVC into the session, runs `deno task tauri build`, and prints
# the paths of the resulting artifacts.

$ErrorActionPreference = "Stop"

# 1. Ensure cargo + deno + scoop shims are on PATH (User PATH may not be in this session)
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
$machinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
$env:Path = "$userPath;$machinePath;$env:Path"

# 2. Load the MSVC environment (link.exe, cl.exe, Windows SDK)
$vsDevShell = "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\Launch-VsDevShell.ps1"
if (-not (Test-Path $vsDevShell)) {
    Write-Error "VS Build Tools not found. Install with:`n  winget install Microsoft.VisualStudio.2022.BuildTools --override `"--wait --passive --add Microsoft.VisualStudio.Workload.VCTools`""
    exit 1
}
& $vsDevShell -Arch amd64 -HostArch amd64 -SkipAutomaticLocation | Out-Null

Set-Location -Path $PSScriptRoot

# 3. Build (forward any extra args, e.g. --debug)
Write-Host "==> Building GlazeWM Editor..." -ForegroundColor Cyan
& deno task tauri build @args
if ($LASTEXITCODE -ne 0) {
    Write-Error "tauri build failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

# 4. Report artifacts
$releaseDir = Join-Path $PSScriptRoot "src-tauri\target\release"
$exe = Join-Path $releaseDir "glazewm-editor.exe"
$bundleDir = Join-Path $releaseDir "bundle"

Write-Host ""
Write-Host "==> Build artifacts:" -ForegroundColor Green
if (Test-Path $exe) {
    $size = [math]::Round((Get-Item $exe).Length / 1MB, 2)
    Write-Host ("  EXE      : {0} ({1} MB)" -f $exe, $size)
}
if (Test-Path $bundleDir) {
    Get-ChildItem -Path $bundleDir -Recurse -Include *.msi, *.exe |
        ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            $kind = ($_.Directory.Name).ToUpper()
            Write-Host ("  {0,-8} : {1} ({2} MB)" -f $kind, $_.FullName, $size)
        }
}
