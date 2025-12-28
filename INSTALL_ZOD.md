# Instrucciones de Instalación

## ⚠️ Acción Requerida

Debido a restricciones de PowerShell, necesitas instalar Zod manualmente:

### Opción 1: CMD (Recomendado)
```cmd
npm install zod
```

### Opción 2: PowerShell (Cambiar política de ejecución)
```powershell
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Luego instalar
npm install zod
```

### Opción 3: Git Bash / WSL
```bash
npm install zod
```

## 📦 Paquete a Instalar

```json
{
  "dependencies": {
    "zod": "^3.22.4"
  }
}
```

## ✅ Verificación

Después de instalar, verifica que funciona:

```bash
npm list zod
```

Deberías ver algo como:
```
chillchess-v2@0.0.1
└── zod@3.22.4
```

## 🚀 Después de Instalar

Una vez instalado Zod, todos los componentes estarán listos para usar:

1. ✅ `src/lib/validation/artist.ts` - Esquemas de validación
2. ✅ `src/lib/components/Modal.svelte` - Modal reutilizable
3. ✅ `src/lib/components/FormInput.svelte` - Input con validación
4. ✅ `src/lib/components/FormTextarea.svelte` - Textarea con validación

Consulta `VALIDATION_GUIDE.md` para ejemplos de uso.
