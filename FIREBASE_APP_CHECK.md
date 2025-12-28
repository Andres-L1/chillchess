# 🛡️ Firebase App Check - Guía de Implementación

Firebase App Check ayuda a proteger tu backend contra tráfico abusivo, como scraping, spam y DDoS.

---

## 📋 ¿Qué es App Check?

App Check verifica que las solicitudes provienen de tu app legítima, no de bots o scrapers.

**Beneficios:**
- ✅ Protección contra bots
- ✅ Previene scraping de datos
- ✅ Mitiga ataques DDoS
- ✅ Protege APIs y Firestore

---

## 🚀 Configuración

### 1. **Habilitar App Check en Firebase Console**

```bash
# Ir a: https://console.firebase.google.com/project/YOUR_PROJECT/appcheck

# 1. Registrar tu app web
# 2. Elegir proveedor de attestation:
#    - reCAPTCHA v3 (Recomendado para web)
#    - reCAPTCHA Enterprise (Para producción con alto tráfico)
```

### 2. **Obtener Site Key de reCAPTCHA**

```bash
# Ir a: https://www.google.com/recaptcha/admin

# 1. Crear nuevo sitio
# 2. Tipo: reCAPTCHA v3
# 3. Dominio: chillchess.app (y localhost para desarrollo)
# 4. Copiar Site Key
```

### 3. **Instalar Dependencias**

```bash
npm install firebase@^10.7.0
```

### 4. **Configurar en tu App**

**Archivo: `src/lib/appcheck.ts`** (crear nuevo)

```typescript
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { app } from './firebase';

// Solo en producción
if (import.meta.env.PROD) {
    const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true // Auto refresh tokens
    });
    
    console.log('✅ Firebase App Check initialized');
}

// En desarrollo (opcional)
if (import.meta.env.DEV) {
    // Usar debug token para testing local
    // self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export default {};
```

### 5. **Variables de Entorno**

Añadir a `.env`:

```bash
# reCAPTCHA v3 Site Key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

Añadir a `.env.example`:

```bash
# Firebase App Check
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

### 6. **Importar en tu App**

**Archivo: `src/routes/+layout.svelte`**

```svelte
<script>
    // Importar App Check
    import '$lib/appcheck';
    // ... resto del código
</script>
```

---

## 🔧 Configurar Enforcement

### Opción A: Monitoring Mode (Recomendado primero)

En Firebase Console > App Check:
- ✅ **Monitoring mode** - Registra solicitudes pero NO las bloquea
- Úsalo durante 1-2 semanas para detectar problemas
- Revisa métricas y ajusta

### Opción B: Enforcement Mode (Producción)

En Firebase Console > App Check:
- ✅ **Enforcement mode** - Bloquea solicitudes sin token válido
- Solo cuando estés seguro que todo funciona

---

## 🧪 Testing

### 1. **Modo Debug (Desarrollo Local)**

```typescript
// En src/lib/appcheck.ts
if (import.meta.env.DEV) {
    // @ts-ignore
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
```

Ir a consola del navegador, verás:
```
Firebase App Check debug token: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

Copiar ese token y añadirlo en Firebase Console:
```
App Check > Debug tokens > Add debug token
```

### 2. **Verificar en Producción**

```bash
# Ver métricas en Firebase Console
# App Check > Metrics

# Deberías ver:
# - Requests with valid tokens
# - Requests with invalid tokens (should be minimal)
```

---

## 📊 Firestore Rules con App Check

Actualizar `firestore.rules` para requerir App Check:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Ejemplo: Requerir App Check para escrituras sensibles
    match /artistProfiles/{profileId} {
      allow read: if true;
      
      allow create, update: if request.auth != null 
                           && request.auth.uid == profileId
                           && isValidProfile()
                           && request.app.id == 'chillchess-app'; // App Check
    }
  }
}
```

---

## 🔄 Rollout Strategy

### Fase 1: Monitoring (Semana 1-2)
- [ ] Habilitar App Check en modo monitor
- [ ] No bloquear ninguna solicitud
- [ ] Recopilar métricas
- [ ] Identificar problemas

### Fase 2: Soft Enforcement (Semana 3)
- [ ] Enforcement para endpoints menos críticos
- [ ] Monitorear errores de usuarios legítimos
- [ ] Ajustar configuración

### Fase 3: Full Enforcement (Semana 4+)
- [ ] Enforcement total
- [ ] Monitoreo continuo
- [ ] Plan de soporte para usuarios con problemas

---

## ⚠️ Consideraciones

### Pros
✅ Protección robusta contra bots  
✅ Fácil de configurar  
✅ No requiere código server-side adicional  
✅ Se integra con Firestore Rules

### Contras
⚠️ reCAPTCHA puede afectar UX (invisible en v3, pero aún así)  
⚠️ Costo adicional con reCAPTCHA Enterprise  
⚠️ Puede bloquear usuarios legítimos con problemas de red  
⚠️ Debug tokens necesarios para desarrollo local

---

## 💰 Costos

### reCAPTCHA v3 (Gratis)
- ✅ Gratis hasta 10,000 assessments/mes
- ⚠️ Sin SLA garantizado
- ✅ Suficiente para proyectos pequeños

### reCAPTCHA Enterprise
- 💰 $1 por 1,000 assessments después de gratis tier
- ✅ SLA del 99.9%
- ✅ Mejor detección de bots
- ✅ Dashboard avanzado

---

## 🎯 Cuándo Implementar

**Implementar App Check si:**
- ✅ Tu app está en producción con tráfico significativo
- ✅ Has detectado scraping o abuso
- ✅ Manejas datos sensibles
- ✅ Tienes presupuesto (si usas Enterprise)

**Posponer si:**
- ⏸️ Estás en fase MVP/beta cerrada
- ⏸️ Tienes <100 usuarios activos
- ⏸️ No has detectado abuso aún
- ⏸️ Prefieres priorizar otras features

---

## 📚 Recursos

- [Documentación oficial](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3](https://developers.google.com/recaptcha/docs/v3)
- [Firestore + App Check](https://firebase.google.com/docs/app-check/firestore-security-rules)

---

## ✅ Checklist de Implementación

- [ ] Crear proyecto en reCAPTCHA
- [ ] Obtener Site Key
- [ ] Añadir a variables de entorno
- [ ] Crear `src/lib/appcheck.ts`
- [ ] Importar en `+layout.svelte`
- [ ] Habilitar en Firebase Console (modo monitor)
- [ ] Generar y registrar debug token
- [ ] Testear localmente
- [ ] Testear en producción
- [ ] Monitorear métricas 1-2 semanas
- [ ] Activar enforcement gradualmente
- [ ] Actualizar Firestore Rules (opcional)

---

**Recomendación:** Implementa App Check después de tener una base de usuarios estable y haber detectado necesidad real de protección contra bots.

**Prioridad:** 🟢 BAJA - Solo si detectas abuso o scraping
