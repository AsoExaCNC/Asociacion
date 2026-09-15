@echo off
title Lanzador Exalumnos App

echo Iniciando Backend en puerto 5000...
start "Backend - Node.js" cmd /k "cd /d D:\Desarrollo\VisualStudioCode\asociacion\backend && npm run dev"

echo Iniciando Frontend en puerto 5173...
start "Frontend - React Vite" cmd /k "cd /d D:\Desarrollo\VisualStudioCode\asociacion\frontend && npm run dev"

echo ¡Servidores iniciados exitosamente!