# Script mejorado con URLs alternativas
$soundsPath = "static\sounds"

# Usando enlaces de archivo directo desde bibliotecas publicas
Write-Host "Descargando sonidos ambientales (puede tardar un momento)..." -ForegroundColor Green

# Rain
Write-Host "`nDescargando rain.mp3..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://cdn.freesound.org/previews/219/219573_1921338-lq.mp3" -OutFile "$soundsPath\rain.mp3" -UseBasicParsing

# Fire
Write-Host "Descargando fire.mp3..." -ForegroundColor Cyan  
Invoke-WebRequest -Uri "https://cdn.freesound.org/previews/235/235911_3516436-lq.mp3" -OutFile "$soundsPath\fire.mp3" -UseBasicParsing

# Cafe
Write-Host "Descargando cafe.mp3..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://cdn.freesound.org/previews/333/333462_2398403-lq.mp3" -OutFile "$soundsPath\cafe.mp3" -UseBasicParsing

# Ocean
Write-Host "Descargando ocean.mp3..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://cdn.freesound.org/previews/233/233129_1648170-lq.mp3" -OutFile "$soundsPath\ocean.mp3" -UseBasicParsing

# Forest
Write-Host "Descargando forest.mp3..." -ForegroundColor Cyan
Invoke-WebRequest -Uri "https://cdn.freesound.org/previews/156/156859_2615119-lq.mp3" -OutFile "$soundsPath\forest.mp3" -UseBasicParsing

Write-Host "`n¡Todos los sonidos descargados exitosamente!" -ForegroundColor Green
Write-Host "Ubicacion: static/sounds/" -ForegroundColor Yellow
Write-Host "`nPuedes probar los sonidos en /app -> White Noise" -ForegroundColor Cyan
