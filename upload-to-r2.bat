@echo off
echo ========================================
echo   Subiendo archivos a R2
echo   Bucket: chillchess-music
echo ========================================
echo.

echo [1/5] Subiendo whitenoise files...
wrangler r2 object put chillchess-music/static/whitenoise/cafe.wav --file static/whitenoise/cafe.wav
wrangler r2 object put chillchess-music/static/whitenoise/forest.wav --file static/whitenoise/forest.wav
wrangler r2 object put chillchess-music/static/whitenoise/ocean.flac --file static/whitenoise/ocean.flac
wrangler r2 object put chillchess-music/static/whitenoise/rain.wav --file static/whitenoise/rain.wav
wrangler r2 object put chillchess-music/static/whitenoise/fire.mp3 --file static/whitenoise/fire.mp3

echo.
echo [2/5] Subiendo ASAP audio files (parte 1/3)...
wrangler r2 object put chillchess-music/static/audio/asap/ASAP_Run_The_Block.wav --file "static/audio/asap/ASAP Run The Block.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Above_It_All.wav --file "static/audio/asap/Above It All.wav"
wrangler r2 object put chillchess-music/static/audio/asap/City_On_Lock.wav --file "static/audio/asap/City On Lock.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Family_First.wav --file "static/audio/asap/Family First.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Feel_like_GOD.wav --file "static/audio/asap/Feel like GOD.wav"

echo.
echo [3/5] Subiendo ASAP audio files (parte 2/3)...
wrangler r2 object put chillchess-music/static/audio/asap/Low_Life.wav --file "static/audio/asap/Low Life.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Never_Stop_Ballin.wav --file "static/audio/asap/Never Stop Ballin'.wav"
wrangler r2 object put chillchess-music/static/audio/asap/No_Lie.wav --file "static/audio/asap/No Lie.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Run_It.wav --file "static/audio/asap/Run It.wav"
wrangler r2 object put chillchess-music/static/audio/asap/Runnin_Thru_LS.wav --file "static/audio/asap/Runnin' Thru' LS.wav"

echo.
echo [4/5] Subiendo ASAP audio files (parte 3/3)...
wrangler r2 object put chillchess-music/static/audio/asap/Sacred_Remastered.wav --file "static/audio/asap/Sacred (Remastered).wav"
wrangler r2 object put chillchess-music/static/audio/asap/Watch_Us_Grow.wav --file "static/audio/asap/Watch Us Grow.wav"
wrangler r2 object put chillchess-music/static/audio/asap/We_Are_One.wav --file "static/audio/asap/We Are One.wav"
wrangler r2 object put chillchess-music/static/audio/asap/We_Gon_Take_It_All.wav --file "static/audio/asap/We Gon' Take It All.wav"

echo.
echo [5/5] Verificando archivos en R2...
wrangler r2 object list chillchess-music --prefix "static/"

echo.
echo ========================================
echo   ✅ COMPLETADO
echo ========================================
echo.
echo Siguientes pasos:
echo   1. Verificar que todos los archivos aparecen arriba
echo   2. Crear backup local (ver guia)
echo   3. Eliminar archivos de static/
echo   4. Actualizar codigo para usar R2 URLs
echo   5. Commit y push
echo.
pause
