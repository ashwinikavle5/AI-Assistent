@echo off
title SpeakWise AI
cd /d "%~dp0"
echo ===================================================
echo           Starting SpeakWise AI Server...
echo ===================================================
echo.
echo Opening http://localhost:5000 in your browser...
start http://localhost:5000
npm start
