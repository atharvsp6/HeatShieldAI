@echo off
echo Starting HeatShield AI Backend...
cd /d "%~dp0\backend"
call venv\Scripts\activate.bat
python main.py
