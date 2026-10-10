@echo off
cd /d "C:\Users\jaqui\OneDrive - Universidad Francisco Gavidia\Escritorio\ahorro-dreams\ahorro"
netstat -ano | findstr ":8765" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  start "" http://127.0.0.1:8765
  exit
)
start "Finanzas" /min "C:\Users\jaqui\AppData\Local\Programs\Python\Python312\python.exe" server.py
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8765
