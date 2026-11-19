@echo off
cd /d "%~dp0"
if not exist node_modules call npm install --no-audit --no-fund
call npx --yes --package=node@22 node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort --open
pause
