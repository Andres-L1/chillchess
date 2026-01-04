@echo off
echo ========================================
echo   Cloudflare Worker - Configuracion
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Configurando el Service Account de Firebase...
echo.
echo Abre Firebase Console y descarga el Service Account JSON:
echo https://console.firebase.google.com/project/chillchess-57365/settings/serviceaccounts/adminsdk
echo.
echo Cuando tengas el archivo JSON descargado:
echo 1. Abrelo con Notepad
echo 2. Selecciona TODO (Ctrl+A)
echo 3. Copia (Ctrl+C)
echo 4. Pega aqui cuando te lo pida
echo.
pause

npx wrangler secret put FIREBASE_SERVICE_ACCOUNT --name chillchess-habit-notifications

if errorlevel 1 (
    echo.
    echo Error configurando el secret. Verifica que:
    echo - Estas logeado en Cloudflare: npx wrangler login
    echo - El JSON esta bien copiado completo
    pause
    exit /b 1
)

echo.
echo [2/3] Desplegando el Worker...
npx wrangler deploy

if errorlevel 1 (
    echo.
    echo Error en el deploy.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   COMPLETADO!
echo ========================================
echo.
echo El Worker esta activo y se ejecutara cada hora.
echo.
echo Para ver los logs:
echo   npx wrangler tail
echo.
pause
