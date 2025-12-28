# 🚀 Cloud Functions - Guía de Deploy

## 📋 Pre-requisitos

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar proyecto (si no está hecho)
firebase use chillchess-57365
```

---

## 🔧 Configuración Inicial

### 1. **Instalar Dependencias**

```bash
cd functions
npm install
```

### 2. **Build Local**

```bash
npm run build
```

### 3. **Testear con Emulators (Opcional)**

```bash
# Requiere Java Runtime
npm run serve

# En otra terminal, testear:
curl http://localhost:5001/chillchess-57365/us-central1/validateArtistProfile
```

---

## 🚀 Deploy

### Opción A: Deploy Solo Functions

```bash
# Desde raíz del proyecto
firebase deploy --only functions

# O específicas:
firebase deploy --only functions:rateLimitArtistProfile
firebase deploy --only functions:validateArtistProfile
firebase deploy --only functions:cleanupRateLimits
```

### Opción B: Deploy Todo

```bash
firebase deploy
```

---

## 📊 Costos Estimados

### Blaze Plan (Pay as you go)

**Invocaciones:**
- 2 millones gratis/mes
- $0.40 por millón adicional

**CPU time:**
- 400,000 GB-segundos gratis/mes
- $0.0000025/GB-segundo adicional

**Networking:**
- 5 GB gratis/mes
- $0.12/GB adicional

**Estimado para 1,000 usuarios activos/mes:**
- ~50,000 invocaciones = **GRATIS**
- ~10 GB-segundos = **GRATIS**

💰 **Costo mensual esperado: $0** (dentro de free tier)

---

## 🧪 Testing

### 1. **Test Rate Limiting**

```javascript
// En tu app, intenta actualizar perfil 6 veces en 24h
// La 6ta debe fallar con error:
// "Has excedido el límite de 5 actualizaciones de perfil por día"
```

### 2. **Test Validación Server-Side**

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const validateProfile = httpsCallable(functions, 'validateArtistProfile');

const result = await validateProfile({
  profile: {
    artistName: "Test Artist",
    bio: "Short bio",
    socialLinks: []
  }
});

console.log(result.data); // { valid: true, message: "Perfil válido" }
```

### 3. **Test Cleanup**

```bash
# Ver logs del scheduler
firebase functions:log --only cleanupRateLimits

# Debe ejecutarse diariamente a medianoche
```

---

## 📈 Monitoreo

### 1. **Functions Dashboard**

```
Firebase Console > Functions
https://console.firebase.google.com/project/chillchess-57365/functions
```

Monitorear:
- Invocaciones (requests)
- Errores
- Latencia
- Costos

### 2. **Logs en Tiempo Real**

```bash
# Ver todos los logs
firebase functions:log

# Solo errores
firebase functions:log --only errors

# Función específica
firebase functions:log --only functions:rateLimitArtistProfile
```

### 3. **Cloud Logging (Avanzado)**

```
Google Cloud Console > Logging
https://console.cloud.google.com/logs
```

---

## 🔄 Actualizar Functions

```bash
# 1. Editar src/index.ts
# 2. Build
cd functions
npm run build

# 3. Deploy
firebase deploy --only functions
```

---

## ⚠️ Troubleshooting

### Error: "Functions region not supported"

```bash
# Cambiar región en firebase.json
{
  "functions": {
    "region": "us-central1"  // O europe-west1
  }
}
```

### Error: "Billing account required"

```
Firebase Console > Upgrade to Blaze Plan
https://console.firebase.google.com/project/chillchess-57365/usage/details
```

**Nota:** Aunque requiere Blaze Plan, el free tier es generoso y no pagarás nada con tráfico normal.

### Error: "npm ERR! ERESOLVE"

```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

---

## 🛡️ Seguridad

### 1. **Proteger Functions con Auth**

Todas las functions ya requieren autenticación:

```typescript
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'Required');
}
```

### 2. **CORS Configuration**

```typescript
import * as cors from 'cors';

const corsHandler = cors({ origin: true });

export const myFunction = functions.https.onRequest((req, res) => {
  corsHandler(req, res, () => {
    // Tu código aquí
  });
});
```

### 3. **Rate Limiting en HTTP Functions**

Ya implementado en `rateLimitArtistProfile` ✅

---

## 📋 Checklist de Deploy

- [ ] Instalar dependencias (`npm install`)
- [ ] Build exitoso (`npm run build`)
- [ ] Testear con emulators (opcional)
- [ ] Verificar que estás en Blaze Plan
- [ ] Deploy (`firebase deploy --only functions`)
- [ ] Ver functions en console
- [ ] Testear en producción
- [ ] Monitorear logs por 24h
- [ ] Configurar alertas (opcional)

---

## 🔔 Alertas (Opcional)

```bash
# Firebase Console > Functions > Metrics > Create Alert

# Alertas recomendadas:
# 1. Error rate > 5%
# 2. Invocations > 100,000/day
# 3. Execution time > 10s
```

---

## 🎯 Próximos Pasos

Después del deploy:

1. **Actualizar frontend** para usar `validateArtistProfile` antes de guardar
2. **Mostrar mensaje** de rate limit en UI
3. **Añadir logs** de usuario cuando se bloquea
4. **Monitorear costos** mensualmente

---

**Última actualización:** 2025-12-28
