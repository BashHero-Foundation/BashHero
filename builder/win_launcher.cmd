@echo off
cd /d "%~dp0"
where py >nul 2>nul && (py -3 start.py) || (python start.py)
if errorlevel 1 pause