# Cloudflare Worker - Configuración Manual

Como el login de Wrangler tiene problemas, vamos a hacerlo desde el Dashboard de Cloudflare directamente:

## 📋 Pasos:

### 1. Crear el Worker desde el Dashboard

1. Ve a: https://dash.cloudflare.com/1ad53c96c0d4d61512c0b69d0221c82d/workers-and-pages
2. Clic en **"Create"** → **"Create Worker"**
3. Dale el nombre: `chillchess-habit-notifications`
4. Clic en **"Deploy"**

### 2. Editar el código del Worker

1. Una vez creado, clic en **"Edit Code"**
2. **Borra todo** el código que aparece
3. **Copia y pega** el contenido del archivo `workers/habitNotifications.ts`
4. Clic en **"Save and Deploy"**

### 3. Configurar el Cron Trigger

1. En la página del Worker, ve a **"Triggers"**
2. Scroll hasta **"Cron Triggers"**
3. Clic en **"Add Cron Trigger"**
4. Ingresa: `0 * * * *` (cada hora en punto)
5. Clic en **"Add Trigger"**

### 4. Configurar Variables de Entorno

1. En la página del Worker, ve a **"Settings"** → **"Variables and Secrets"**
2. **Environment Variables**:
   - Name: `FIREBASE_PROJECT_ID`
   - Value: `chillchess-57365`
   - Clic en **"Add variable"**

3. **Secrets** (importante - es donde va el JSON):
   - Clic en **"Add variable"** en la sección **"Secrets"**
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: **[Pega aquí TODO el JSON de Firebase que me diste]**
   - Clic en **"Encrypt"**

### 5. Verificar

1. Ve a **"Logs"** en el Worker
2. Espera hasta la próxima hora en punto
3. Deberías ver logs de ejecución

---

## ✅ ¿Necesitas el código del Worker para copiar?

Está en: `ChillChess/workers/habitNotifications.ts`

O puedes copiarlo de aquí:

```typescript
// [El código está en el archivo workers/habitNotifications.ts]
```

**¿Quieres que te prepare el código en texto plano para copiar fácilmente?** 📝
