# 🔒 Instrucciones de Deploy Seguro

## 📋 Pre-Deploy Checklist

Antes de hacer deploy a producción, asegúrate de:

### 1. **Actualizar Firestore Rules**

```bash
# Testear reglas localmente (opcional)
npm install -g firebase-tools
firebase emulators:start

# Deploy de reglas
firebase deploy --only firestore:rules
```

**Verifica que las nuevas reglas incluyen:**
- ✅ Validación de longitudes (artistName, bio)
- ✅ Límite de socialLinks (máx 10)
- ✅ Validación de campos permitidos
- ✅ Protección contra campos adicionales

### 2. **Variables de Entorno (Opcional pero Recomendado)**

```bash
# 1. Crear archivo .env local
cp .env.example .env

# 2. Completar con tus credenciales
# Edita .env con tus valores de Firebase

# 3. Actualizar src/lib/firebase.ts
# Reemplazar valores hardcoded por import.meta.env.VITE_*

# 4. Asegúrate que .env esté en .gitignore
echo ".env" >> .gitignore
```

### 3. **Netlify Environment Variables**

Si usas variables de entorno, configúralas en Netlify:

```bash
# En Netlify Dashboard:
# Site Settings > Environment Variables > Add variable

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123:web:abc
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### 4. **Verificar Git**

```bash
# Asegúrate que .env NO está en Git
git ls-files | grep .env
# Debe estar vacío o solo .env.example

# Si .env está trackeado:
git rm --cached .env
git commit -m "Remove .env from tracking"
```

---

## 🚀 Deploy Steps

### Opción A: Deploy Solo de Firestore Rules

```bash
# 1. Verificar cambios
firebase deploy --only firestore:rules --dry-run

# 2. Deploy
firebase deploy --only firestore:rules

# 3. Verificar en Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/firestore/rules
```

### Opción B: Deploy Completo (App + Rules)

```bash
# 1. Build local para verificar
npm run build

# 2. Deploy a Netlify (automático con git push)
git add -A
git commit -m "security: improve firestore rules with content validation"
git push origin main

# 3. Deploy Firestore Rules
firebase deploy --only firestore:rules
```

---

## 🧪 Testing de Seguridad

### Test 1: Artist Profile Validation

```javascript
// Intenta crear un perfil con nombre muy largo (debe fallar)
const invalidProfile = {
  artistName: "a".repeat(100), // 100 caracteres (límite es 50)
  bio: "Test",
  socialLinks: []
};

// Debe mostrar error de Firestore
```

### Test 2: Social Links Limit

```javascript
// Intenta crear más de 10 links (debe fallar)
const tooManyLinks = Array(15).fill({
  platform: "spotify",
  url: "https://spotify.com",
  label: "My Spotify"
});

const profile = {
  artistName: "Test",
  bio: "Test",
  socialLinks: tooManyLinks
};

// Debe mostrar error de Firestore
```

### Test 3: Unauthorized Fields

```javascript
// Intenta añadir campo no permitido (debe fallar)
const maliciousProfile = {
  artistName: "Test",
  bio: "Test",
  socialLinks: [],
  isAdmin: true, // ❌ Campo no permitido
  customField: "hacked" // ❌ Campo no permitido
};

// Debe mostrar error de Firestore
```

---

## 📊 Monitoreo Post-Deploy

### 1. **Firestore Metrics**

Ir a Firebase Console > Firestore > Usage

Monitorear:
- Reads/writes count
- Document count
- Errores de seguridad (denials)

### 2. **Logs de Seguridad**

```bash
# Ver logs en tiempo real
firebase functions:log --only firestore

# O en Firebase Console
# https://console.firebase.google.com/project/YOUR_PROJECT/logs
```

### 3. **Alertas**

Configurar alertas en Firebase:
- Spike en writes
- Errores de autenticación
- Violations de security rules

---

## 🔄 Rollback Plan

Si algo sale mal:

```bash
# 1. Revertir reglas de Firestore
firebase deploy --only firestore:rules

# 2. Usar versión anterior del archivo
git checkout HEAD~1 firestore.rules
firebase deploy --only firestore:rules

# 3. Verificar en consola que las reglas se restauraron
```

---

## ✅ Post-Deploy Checklist

- [ ] Firestore Rules desplegadas exitosamente
- [ ] Testear creación de perfil de artista (debe funcionar)
- [ ] Testear crear con nombre muy largo (debe fallar)
- [ ] Testear crear con >10 links (debe fallar)
- [ ] Verificar que usuarios existentes aún pueden acceder
- [ ] Monitorear logs por 24h para detectar problemas
- [ ] Documentar cualquier incidente

---

## 📞 En Caso de Emergencia

Si detectas problemas de seguridad:

1. **Desactivar usuario sospechoso:**
   - Firebase Console > Authentication > Users
   - Click en usuario > Disable account

2. **Revisar actividad:**
   - Firestore > Usage
   - Logs > Filter by user

3. **Rotar credenciales (si es necesario):**
   - Firebase Console > Project Settings
   - Regenerar API key

4. **Contactar equipo:**
   - Notificar a desarrolladores
   - Documentar incidente
   - Implementar fix

---

**Última actualización:** 2025-12-28
**Próxima revisión:** 2025-01-28
