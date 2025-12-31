# Firestore Security Rules - Changelog

**Última actualización:** 2025-12-31

## Colecciones Nuevas a Añadir

### `bug_reports` Collection

```javascript
// Bug Reports - Cualquiera puede leer y crear, solo admins pueden editar/eliminar
match /bug_reports/{bugId} {
  // Permitir lectura a todos (bugs son públicos)
  allow read: if true;
  
  // Permitir creación a cualquier usuario (incluye anónimos)
  allow create: if true;
  
  // Solo admins pueden actualizar (cambiar estado, añadir notas)
  allow update: if request.auth != null 
                && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
  
  // Solo admins pueden eliminar
  allow delete: if request.auth != null
                && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

**Validación de Datos:**
```javascript
match /bug_reports/{bugId} {
  allow create: if request.resource.data.keys().hasAll(['title', 'description', 'severity', 'browser', 'os', 'status', 'createdAt'])
                && request.resource.data.title is string
                && request.resource.data.title.size() >= 5
                && request.resource.data.title.size() <= 100
                && request.resource.data.description is string
                && request.resource.data.description.size() >= 10
                && request.resource.data.description.size() <= 500
                && request.resource.data.severity in ['low', 'medium', 'high', 'critical']
                && request.resource.data.status == 'reported' // Forzar status inicial
                && request.resource.data.createdAt == request.time;
}
```

---

## Instrucciones para Aplicar

### Opción 1: Firebase Console (GUI)
1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar proyecto ChillChess
3. Firestore Database → Rules
4. Añadir el bloque de `bug_reports` dentro del bloque principal
5. Publicar cambios

### Opción 2: Firebase CLI
```bash
# Ubicación del archivo: firestore.rules (raíz del proyecto)
firebase deploy --only firestore:rules
```

---

## Archivo Completo (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Users Collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }
    
    // Albums Collection (public read, admin write)
    match /albums/{albumId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Proposals Collection
    match /proposals/{proposalId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isAdmin(); // Voting handled in client with increment
      allow delete: if isAdmin();
    }
    
    // Music Submissions
    match /musicSubmissions/{submissionId} {
      allow read: if isAdmin() || (isSignedIn() && resource.data.userId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // BUG REPORTS (NUEVO)
    match /bug_reports/{bugId} {
      allow read: if true; // Public read
      allow create: if true; // Anyone can report bugs
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }
    
    // Listen Rooms
    match /listenRooms/{roomId} {
      allow read: if true;
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isAdmin() || (isSignedIn() && resource.data.hostId == request.auth.uid);
    }
  }
}
```

---

## Testing de Reglas

### Test 1: Lectura Pública
```javascript
// Cualquier usuario (incluido anónimo) puede leer bugs
READ /bug_reports/test123
✅ PASS (no auth required)
```

### Test 2: Creación Libre
```javascript
// Cualquier usuario puede crear bug reports
CREATE /bug_reports/new_bug
{
  title: "Test bug",
  description: "This is a test",
  severity: "low",
  status: "reported",
  ...
}
✅ PASS
```

### Test 3: Update Solo Admin
```javascript
// Usuario normal NO puede actualizar
UPDATE /bug_reports/test123 as user123
❌ FAIL (expected)

// Admin SÍ puede actualizar
UPDATE /bug_reports/test123 as admin_user
✅ PASS
```

---

## Notas Importantes

1. **Seguridad vs Usabilidad:**
   - Permitimos creación sin auth para facilitar reportes
   - Riesgo de spam mitigado por moderación admin

2. **Alternativa Más Segura (Si hay spam):**
   ```javascript
   // Requiere autenticación para reportar
   allow create: if isSignedIn();
   ```

3. **Rate Limiting:**
   - Considerar implementar Cloud Functions para rate limiting si hay abuso
   - Límite sugerido: 5 reports por IP por hora

---

**Aplicado:** ❌ Pendiente  
**Prioridad:** 🔴 ALTA (requerido para que /bugs funcione)  
**Próximo paso:** Aplicar reglas en Firebase Console
