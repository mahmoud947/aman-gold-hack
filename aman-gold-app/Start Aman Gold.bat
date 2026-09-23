@echo off
cd /d "%~dp0"
echo Starting Aman Gold prototype on http://localhost:3200
echo Keep this window open while you use the prototype. Close it to stop.
start "" cmd /c "timeout /t 10 >nul & start http://localhost:3200"
npm run dev
