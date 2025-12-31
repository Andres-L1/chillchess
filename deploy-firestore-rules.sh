#!/bin/bash

# Deploy Firestore Rules to Firebase
# Este script despliega SOLO las reglas de Firestore sin tocar funciones ni hosting

echo "🔥 Desplegando Firestore Security Rules..."
echo ""
echo "Archivo: firestore.rules"
echo "Proyecto: ChillChess"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado"
    echo "Instalar con: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null
then
    echo "❌ No has iniciado sesión en Firebase"
    echo "Ejecutar: firebase login"
    exit 1
fi

# Deploy only Firestore rules
echo "📤 Desplegando reglas..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Reglas de Firestore desplegadas correctamente!"
    echo ""
    echo "Cambios aplicados:"
    echo "  - bug_reports collection: Lectura pública, escritura libre, admin updates"
    echo "  - Todas las demás colecciones: Reglas existentes mantenidas"
    echo ""
else
    echo ""
    echo "❌ Error al desplegar reglas"
    echo "Verifica que estés en el proyecto correcto"
    exit 1
fi
