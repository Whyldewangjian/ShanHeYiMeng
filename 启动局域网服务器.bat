@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Wuxia Game Server

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Please install Node.js first:
  echo         https://nodejs.org
  echo.
  pause
  exit /b 1
)

node server.js
pause
