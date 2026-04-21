@echo off
setlocal
cd /d "%~dp0"

if not exist node_modules (
  echo [setup] Installing dependencies...
  call npm install
  if errorlevel 1 goto :fail
)

echo [run] Starting debug server...
call npm run dev
if errorlevel 1 goto :fail

goto :eof

:fail
echo.
echo [error] Startup failed. Please check logs above.
exit /b 1
