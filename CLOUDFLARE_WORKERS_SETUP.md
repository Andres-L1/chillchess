# Cloudflare Workers para Notificaciones de Hábitos

## 🚀 Configuración

### 1. Instalar Wrangler (ya hecho)
```bash
npm install -D wrangler
```

### 2. Obtener Service Account de Firebase

1. Ve a https://console.firebase.google.com
2. Project Settings → Service Accounts
3. Generate New Private Key
4. Descarga el JSON

### 3. Configurar el Worker

```bash
# Login en Cloudflare
npx wrangler login

# Configurar el secret del Service Account
npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
# Pega todo el contenido del JSON de Firebase cuando te lo pida
```

### 4. Instalar dependencia para JWT

```bash
npm install @tsndr/cloudflare-worker-jwt
```

### 5. Desplegar

```bash
npx wrangler deploy
```

## 📅 Cómo funciona

1. **Cron Trigger**: Se ejecuta cada hora (`0 * * * *`)
2. **Consulta Firebase**: Obtiene todos los hábitos con `notification: true`
3. **Verifica hora**: Compara `notTime` del hábito con la hora actual
4. **Envía notificación**: Usa FCM para enviar push al usuario

## 🔧 Testing Local

```bash
# Ejecutar el worker localmente
npx wrangler dev

# Ejecutar el cron manualmente (para testing)
curl "http://localhost:8787/__scheduled?cron=0+*+*+*+*"
```

## 💰 Costos

- ✅ **100,000 requests/día gratis**
- ✅ Cada ejecución del cron = 1 request
- ✅ 24 ejecuciones/día (cada hora)
- ✅ **Totalmente gratuito para tu uso**

## 🔐 Variables de Entorno

Se configuran en Cloudflare Dashboard o con `wrangler secret`:

- `FIREBASE_PROJECT_ID`: ID del proyecto Firebase
- `FIREBASE_SERVICE_ACCOUNT`: JSON completo del Service Account

## 📊 Monitoreo

Ver logs en tiempo real:
```bash
npx wrangler tail
```

O en Cloudflare Dashboard → Workers → chillchess-habit-notifications → Logs

## 🔄 Actualizar el Worker

```bash
# Hacer cambios en workers/habitNotifications.ts

# Redesplegar
npx wrangler deploy
```

## ⚠️ Notas Importantes

1. El Worker necesita acceso a Firebase Admin SDK
2. Los usuarios deben tener `fcmToken` guardado en Firestore
3. La VAPID key debe estar configurada en el frontend
4. Las notificaciones solo se envían si el hábito NO está completado ese día
