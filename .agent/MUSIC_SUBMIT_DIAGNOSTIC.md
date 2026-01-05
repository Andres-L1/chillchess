# MÚSICA SUBMIT - DIAGNÓSTICO COMPLETO DEL SISTEMA
**Fecha**: 2026-01-05
**Estado**: Verificación sistemática sin suposiciones

## 1. ARQUITECTURA DEL SISTEMA

### Firebase (Perfiles y Metadata)
- **Colección**: `musicSubmissions`
- **Uso**: Almacenar metadata de envíos (título, artista, género, etc.)
- **Reglas**: ✅ Configuradas correctamente
  - Create: Usuario autenticado, `userId == request.auth.uid`
  - Read: Admin o propietario
  - Update/Delete: Solo admin

### Cloudflare R2 (Archivos Grandes)
- **Uso**: Almacenar archivos de audio y portadas
- **Carpetas**:
  - `submissions/`: Archivos temporales de envíos
  - `catalog/`: Archivos aprobados y publicados
- **Autenticación**: Bearer token de Firebase en headers

## 2. FLUJO COMPLETO DE ENVÍO

### Paso 1: Verificación PRO
```typescript
$: isPro = $userSubscription.tier === 'pro';
```
- ✅ Implementado
- ❓ PUNTO DE VERIFICACIÓN: ¿Los usuarios PRO tienen `tier === 'pro'` en Firestore?

### Paso 2: Recolección de datos del formulario
1. Título del lanzamiento
2. Género (con opción "Otra" + campo custom)
3. Categoría (música/juegos/ambiente)
4. Portada (imagen, max 5MB)
5. Archivos de audio (MP3/WAV/M4A, max 500MB c/u)

### Paso 3: Subida a R2
**Endpoint**: `/api/r2/sign-url`
**Autenticación**: ✅ Bearer token incluido
```typescript
headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,  // ⚠️ SIN COMILLAS EN KEY
}
```
⚠️ **POSIBLE PROBLEMA**: Línea 182 debería ser `'Authorization'` con comillas

### Paso 4: Guardado en Firestore
**Colección**: ✅ `musicSubmissions` (correcto)
**Campos guardados**:
- userId
- artistName
- releaseTitle
- genre
- category
- r2CoverKey
- r2AudioKeys
- submissionType: 'r2_direct'
- status: 'pending'
- submittedAt: serverTimestamp()

## 3. VERIFICACIONES NECESARIAS

### ¿Estas reglas de Firestore están DESPLEGADAS en producción?
```bash
firebase deploy --only firestore:rules
```

### ¿El usuario tiene tier='pro' en Firestore?
Verificar documento `/users/{userId}`:
```json
{
  "subscriptionTier": "pro",  // ¿Es exactamente "pro"?
  "subscriptionStatus": "active"
}
```

### ¿Las variables de entorno R2 están configuradas en Netlify?
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `PUBLIC_R2_ACCOUNT_ID`

## 4. PROBLEMAS RESUELTOS HOY

1. ✅ Error 500 SSR en `/artist/submit` - `ssr = false`
2. ✅ Token auth faltante - `Authorization: Bearer ${token}`
3. ✅ Validación no reactiva - Variables reactivas `$:`
4. ✅ Colección incorrecta - `submissions` → `musicSubmissions`
5. ✅ Portadas no visibles - `loadR2CoverUrl()`
6. ✅ Error 500 en `/admin` - `ssr = false`
7. ✅ Service worker error - Promise handling

## 5. PUNTOS CRÍTICOS A VERIFICAR AHORA

### A. ¿El header Authorization tiene comillas?
**Ubicación**: `src/routes/artist/submit/+page.svelte:182`
**Actual**: `Authorization: \`Bearer ${token}\``
**Debería ser**: `'Authorization': \`Bearer ${token}\``

### B. ¿userSubscription.tier devuelve exactamente 'pro'?
**Verificar en**: `src/lib/subscription/userSubscription.ts`

### C. ¿Las reglas de Firestore están desplegadas?
**Comando**: `firebase deploy --only firestore:rules`

### D. ¿R2 credentials están en Netlify?
**Verificar en**: Netlify Dashboard → Site settings → Environment variables

## 6. SIGUIENTES PASOS

1. Arreglar header `Authorization` (agregar comillas)
2. Verificar estado real de `userSubscription.tier` en consola
3. Confirmar que reglas de Firestore están desplegadas
4. Confirmar que env vars de R2 están en Netlify
5. Verificar permisos de admin en Firebase Auth

## 7. COMANDOS DE VERIFICACIÓN

```bash
# Ver últimos deploys
git log --oneline -5

# Ver estado de archivos
git status

# Verificar si reglas están sincronizadas
firebase deploy --only firestore:rules --dry-run

# Ver qué está en producción
curl https://chillchess.app/artist/submit -I
```
