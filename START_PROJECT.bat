@echo off
title Glaucoma-ViT - Live System Launcher
color 0A

echo ========================================================
echo   Glaucoma-ViT: Live Web System Launcher
echo ========================================================
echo.

set "PATH=C:\Program Files\nodejs;%PATH%"

echo [1/3] Starting Backend API (FastAPI on Port 8000)...
start "Glaucoma Backend API" /min cmd /c "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Frontend UI (React + Vite on Port 5173)...
start "Glaucoma Frontend" /min cmd /c "cd /d "%~dp0frontend" && npm run dev -- --host 0.0.0.0"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Public Cloudflare Tunnel...
echo.
echo ========================================================
echo   Look below for your Public HTTPS Link (trycloudflare.com)
echo   Keep this window OPEN during your PPT / Viva!
echo ========================================================
echo.

"C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:5173

pause
