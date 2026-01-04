# Sistema de Notificaciones Locales - ChillChess Habit Tracker

## 🎯 Resumen

El sistema de notificaciones funciona **100% en el navegador** sin necesidad de backend, Cloud Functions ni facturación adicional.

## 🏗️ Arquitectura

### Componentes:

1. **Service Worker** (`static/service-worker.js`)
   - Registrado al cargar la app
   - Verifica cada minuto si hay recordatorios pendientes
   - Muestra notificaciones nativas del navegador

2. **IndexedDB** (almacenamiento local)
   - Base de datos: `chillchess-habits`
   - Store: `scheduled-notifications`
   - Guarda: `{ habitId, habitTitle, time, lastNotified }`

3. **API de Notificaciones** (`src/lib/notifications.ts`)
   - `registerServiceWorker()`: Registra el SW
   - `requestNotificationPermission()`: Solicita permisos
   - `scheduleHabitNotification()`: Programa un recordatorio
   - `cancelHabitNotification()`: Cancela un recordatorio
   - `showTestNotification()`: Muestra notificación de prueba

## ⚙️ Cómo Funciona

### 1. Usuario crea un hábito con recordatorio:
```typescript
{
  title: "Hacer ejercicio",
  notification: true,
  notTime: "08:00"
}
```

### 2. Se guarda en IndexedDB:
```javascript
{
  habitId: "abc123",
  habitTitle: "Hacer ejercicio",
  time: "08:00",
  lastNotified: null
}
```

### 3. Service Worker verifica cada minuto:
```javascript
setInterval(async () => {
  const currentTime = "08:00"; // Hora actual
  // Si coincide con algún recordatorio programado:
  if (notif.time === currentTime && notif.lastNotified !== today) {
    // Mostrar notificación
    await self.registration.showNotification(...)
    // Marcar como notificado hoy
    notif.lastNotified = "2024-01-03";
  }
}, 60000);
```

### 4. Usuario recibe la notificación:
- **App abierta**: Notificación visible en pantalla
- **App cerrada**: Notificación del sistema operativo
- **Click en notificación**: Abre `/app`

## ✅ Ventajas

- ✅ **Gratis**: Sin costos de Cloud Functions
- ✅ **Offline**: Funciona sin conexión
- ✅ **Privado**: Todo en el cliente
- ✅ **Multiplataforma**: Chrome, Firefox, Safari, Edge

## ⚠️ Limitaciones

- ❌ No funciona si el navegador está 100% cerrado (necesita pestaña abierta en background)
- ❌ Precisión de ±1 minuto (verifica cada 60 segundos)
- ❌ No envía recordatorios por SMS/email (solo notificaciones push del navegador)

## 📱 Uso

### En el código:

```typescript
// 1. Solicitar permisos
const hasPermission = await requestNotificationPermission();

// 2. Programar recordatorio
await scheduleHabit Notification(habitId, "Meditar", "20:00");

// 3. Cancelar recordatorio
await cancelHabitNotification(habitId);
```

### Para el usuario:

1. Clic en "Recordatorios" (botón campana)
2. Aceptar permisos del navegador
3. Crear hábito y activar toggle de "Recordatorio Diario"
4. Seleccionar hora
5. Guardar

## 🔄 Alternativa con Cloud Functions (si decides activar facturación)

Si en el futuro quieres:
- Envíos más confiables
- Notificaciones aunque el navegador esté cerrado
- Envíos por email/SMS

Puedes volver a usar las Cloud Functions que creamos en `functions/src/habitReminders.ts` (solo necesitas habilitar Artifact Registry API).

## 🛠️ Debugging

Para testear inmediatamente:
```javascript
await showTestNotification();
```

Ver recordatorios programados:
```javascript
// Abrir DevTools → Application → IndexedDB → chillchess-habits
```

Logs del Service Worker:
```javascript
// DevTools → Application → Service Workers → Console
```
