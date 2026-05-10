@echo off
title PlatePal Launcher
cd /d "%~dp0"

echo ================================================
echo            PlatePal - Launching...
echo ================================================
echo.

echo [1/3] Starting Backend Server (port 5000)...
start "PlatePal Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

echo [2/3] Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo [3/3] Starting Frontend Dev Server (port 5173)...
start "PlatePal Frontend" cmd /k "cd /d "%~dp0platepal-frontend" && npm run dev"

echo.
echo Waiting for frontend to start...
timeout /t 6 /nobreak >nul

echo Opening browser (private/incognito window)...

set "URL=http://localhost:5173"
set "CHROME=%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
set "EDGE=%PROGRAMFILES%\Microsoft\Edge\Application\msedge.exe"
set "EDGE32=%PROGRAMFILES(X86)%\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
    start "" "%CHROME%" --incognito "%URL%"
    goto done
)
if exist "%EDGE%" (
    start "" "%EDGE%" --inprivate "%URL%"
    goto done
)
if exist "%EDGE32%" (
    start "" "%EDGE32%" --inprivate "%URL%"
    goto done
)
:: Fallback: open in default browser (no incognito)
start "" "%URL%"

:done
echo.
echo ================================================
echo  PlatePal is running!
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo ================================================
echo.
echo Two terminal windows have opened:
echo  - "PlatePal Backend"  - keep this open
echo  - "PlatePal Frontend" - keep this open
echo.
echo Close those windows to stop the servers.
pause
