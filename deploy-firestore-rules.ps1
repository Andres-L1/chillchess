# Deploy Firestore Rules to Firebase
# Este script despliega SOLO las reglas de Firestore sin tocar funciones ni hosting

Write-Host "🔥 Desplegando Firestore Security Rules..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Archivo: firestore.rules"
Write-Host "Proyecto: ChillChess"
Write-Host ""

# Check if firebase CLI is installed
try {
    $null = Get-Command firebase -ErrorAction Stop
} catch {
    Write-Host "❌ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "Instalar con: npm install -g firebase-tools"
    exit 1
}

# Deploy only Firestore rules
Write-Host "📤 Desplegando reglas..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Reglas de Firestore desplegadas correctamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Cambios aplicados:"
    Write-Host "  - bug_reports collection: Lectura pública, escritura libre, admin updates"
    Write-Host "  - Todas las demás colecciones: Reglas existentes mantenidas"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error al desplegar reglas" -ForegroundColor Red
    Write-Host "Verifica que estés en el proyecto correcto"
    exit 1
}
