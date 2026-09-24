@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "PORT=8877"
set "URL=http://127.0.0.1:%PORT%/avatar-lab.html"

powershell -NoProfile -Command ^
  "$c = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1;" ^
  "if ($c) { exit 0 } else { exit 1 }" >nul 2>&1
if errorlevel 1 (
  start "CV-Page-lab-8877" /MIN py -3 -m http.server %PORT% --directory "%~dp0"
  timeout /t 1 /nobreak >nul
)

start "" "%URL%"
echo Lab: %URL%
