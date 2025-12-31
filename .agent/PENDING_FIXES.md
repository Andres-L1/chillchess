# ChillChess - Tareas Pendientes y Problemas Reportados

**Última actualización:** 2025-12-31 03:11 UTC

---

## ✅ CORREGIDO (Sesión Actual)

### 1. Volumen del Reproductor
**Problema:** Slider vertical cortado/no visible  
**Causa:** Z-index insuficiente (50)  
**Solución:** Aumentado a `z-[200]` en `VolumeControl.svelte`  
**Archivo:** `src/lib/components/player/VolumeControl.svelte:55`  
**Estado:** ✅ Corregido y deployado

### 2. Errores F12 (Audio)
**Problema:** Warnings innecesarios en consola por archivos de audio faltantes  
**Archivos afectados:**
- Ambience (rain, library, garden)
- White Noise (rain, fire, cafe, ocean, forest)

**Solución:** Cambiados `console.warn()` a comentarios silenciosos  
**Archivo:** `src/lib/components/AudioPlayer.svelte:380, 391, 400`  
**Estado:** ✅ Corregido

---

## ⚠️ PENDIENTE (Requiere Acción)

### 3. Badge de Verificados en `/artists`
**Problema:** La insignia de verificado no aparece en la lista de artistas  
**Ubicación:** https://chillchess.app/artists  
**Archivo:** `src/routes/artists/+page.svelte:216`

**Análisis:**
- El componente `<VerifiedBadge />` está presente en el código (línea 216)
- Todos los artistas en esta página ya están filtrados por `isVerified === true`
- El badge debería mostrarse siempre

**Posibles Causas:**
1. ✅ El componente existe y está importado (línea 5)
2. ❓ CSS del badge podría estar oculto (`display: none` o `opacity: 0`)
3. ❓ El componente VerifiedBadge puede tener lógica condicional interna
4. ❓ Z-index conflicto con otros elementos

**Acción Recomendada:**
```bash
# Revisar el componente VerifiedBadge
1. Ver src/lib/components/VerifiedBadge.svelte
2. Verificar si tiene condicionales internas (ej: if isVerified)
3. Revisar CSS (display, visibility, opacity, z-index)
4. Testear en local agregando un console.log() en el componente
```

**Prioridad:** 🔴 ALTA (afecta UX y confianza del usuario)

---

### 4. Sistema de Reportes de Bugs
**Solicitud:** Sistema similar a Propuestas pero para bugs, accesible para usuarios Free  
**Diferencias vs Propuestas:**
- ✅ Usuarios Free pueden reportar (no solo Pro)
- ✅ Sin sistema de votación (bugs no se votan)
- ✅ Campos diferentes: Título, Descripción, Severidad, Navegador/OS
- ✅ Estados: "Reportado", "En Revisión", "Solucionado", "No es Bug"

**Plan de Implementación:**

#### Fase 1: Colección Firestore
```typescript
// Collection: bug_reports
interface BugReport {
  id: string;
  title: string;
  description: string;
  steps: string;              // Pasos para reproducir
  severity: 'low' | 'medium' | 'high' | 'critical';
  browser: string;            // Chrome, Firefox, Safari
  os: string;                 // Windows, Mac, Linux, iOS, Android
  author: string;
  authorUid: string;
  status: 'reported' | 'reviewing' | 'fixed' | 'not-a-bug';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  adminNotes?: string;        // Notas del admin
}
```

#### Fase 2: Frontend `/bugs`
**Crear:** `src/routes/bugs/+page.svelte`

**Características:**
1. **Form de Reporte** (sin auth requerida, pero anónimos se guardan sin user data)
2. **Lista de Bugs** (todos los usuarios pueden ver)
3. **Sin votación** (a diferencia de proposals)
4. **Filtrado:** Por severidad y estado

**Ejemplo de UI:**
```svelte
<!-- Formulario -->
<input placeholder="Título del problema" />
<textarea placeholder="Describe el bug..." rows="4" />
<textarea placeholder="¿Cómo reproducirlo paso a paso?" rows="3" />
<select> <!-- Severidad: Bajo, Medio, Alto, Crítico --> </select>
<select> <!-- Navegador --> </select>
<select> <!-- Sistema Operativo --> </select>
<button>📩 Enviar Reporte</button>

<!-- Lista -->
<div class="bug-card">
  <span class="severity-badge">🔴 Crítico</span>
  <h3>Reproductor no se pausa en móvil</h3>
  <p>Safari • iOS 17 • Por @Usuario</p>
  <span class="status">✅ Solucionado</span>
</div>
```

#### Fase 3: Admin Panel Integration
**Añadir tab "Bugs" en `/admin`:**
- Ver todos los reportes
- Cambiar estado
- Añadir notas internas
- Marcar como duplicado
- Enlazar a issues de GitHub (opcional)

**Estimación de Tiempo:** 3-4 horas

**Archivos a Crear:**
- `src/routes/bugs/+page.svelte` (UI principal)
- `src/lib/components/admin/BugsTab.svelte` (Admin panel)
- Firestore Rules para `bug_reports` collection

**Prioridad:** 🟡 MEDIA (mejora QA y feedback)  
**Estado:** ✅ **IMPLEMENTADO** (2025-12-31)

**Archivos Creados:**
- `src/routes/bugs/+page.svelte` - Página pública de reportes
- `src/lib/components/admin/BugsTab.svelte` - Panel de gestión en admin
- Integrado en `/admin` con stats y badge

**Acceso:**
- Usuarios: `https://chillchess.app/bugs`
- Admin: `/admin` → Tab "Bugs 🐛"

---

### 5. Sistema de Respaldo y Persistencia de Datos
**Requisito:** No debe haber pérdida de datos en Firebase ni R2 (excepto archivos temporales rechazados)  
**Estado Actual:** Sin backups automáticos configurados

**Análisis:**
- ✅ **Firebase Firestore:** No hay backups automáticos configurados
- ✅ **R2 (Cloudflare):** No hay versionado ni backups configurados
- ⚠️ Riesgo: Eliminación accidental, corrupción, ataques

**Solución Propuesta:**

#### A. Firebase Firestore Backups
1. **Exportación Programada (Recomendado):**
```bash
# Google Cloud Scheduler + Cloud Functions
# Exportar cada 24h a Google Cloud Storage
gcloud firestore export gs://chillchess-backups/firestore/$(date +%Y%m%d)
```

2. **Alternative: Manual via Firebase Console**
   - Ir a Firestore → Importar/Exportar
   - Exportar a bucket GCS
   - Configurar Cloud Scheduler semanal

#### B. R2 Object Versioning
```javascript
// Habilitar versionado en R2
// Opción 1: Via Dashboard Cloudflare
//   - Ir a R2 → Bucket Settings
//   - Enable "Object Versioning"

// Opción 2: Via API/Terraform
{
  "versioning": {
    "status": "Enabled"
  }
}
```

#### C. Política de Retención
**Archivos Temporales (Sí se eliminan):**
- `submissions/temp/*` → Eliminación automática después de 3 días ✅ YA IMPLEMENTADO
- Submissions rechazados → Mover a `submissions/rejected/` antes de eliminar

**Archivos Permanentes (NO se eliminan):**
- `albums/*` → **NUNCA** eliminar automáticamente
- `avatars/*` → Mantener indefinidamente
- Metadata de Firestore → Backups diarios

#### D. Implementación Paso a Paso

**Fase 1: Configurar Firestore Exports (2h)**
```typescript
// functions/scheduled-backup.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const scheduledFirestoreBackup = functions
  .pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const projectId = process.env.GCP_PROJECT || 'chillchess';
    const bucket = 'gs://chillchess-backups';
    const date = new Date().toISOString().split('T')[0];
    
    await admin.firestore().exportDocuments({
      collectionIds: ['users', 'albums', 'proposals', 'bug_reports'],
      outputUriPrefix: `${bucket}/firestore/${date}`
    });
    
    console.log(`✅ Backup completed: ${date}`);
  });
```

**Fase 2: Habilitar R2 Versioning (30min)**
1. Dashboard Cloudflare → R2
2. Seleccionar bucket `chillchess-music`
3. Settings → Enable Versioning
4. Configurar lifecycle: Mantener últimas 5 versiones

**Fase 3: Política de Archivos Rechazados (1h)**
```typescript
// src/routes/api/admin/reject-submission/+server.ts
export const POST = async ({ request, locals }) => {
  // ... auth checks
  const { submissionId } = await request.json();
  
  // 1. Mover archivos a /rejected/ en lugar de eliminar
  const files = await getSubmissionFiles(submissionId);
  for (const file of files) {
    await r2.copyObject({
      Bucket: R2_BUCKET,
      CopySource: `${R2_BUCKET}/${file.key}`,
      Key: file.key.replace('submissions/temp/', 'submissions/rejected/')
    });
  }
  
  // 2. Programar eliminación definitiva después de 30 días
  await scheduleCleanup(submissionId, 30);
  
  // 3. Actualizar Firestore
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'rejected',
    rejectedAt: serverTimestamp()
  });
};
```

**Fase 4: Dashboard de Backups (Admin Panel) (2h)**
```svelte
<!-- BackupsTab.svelte -->
<div class="backups-status">
  <h3>Estado de Respaldos</h3>
  
  <div class="backup-card">
    <h4>🔥 Firestore</h4>
    <p>Último backup: {lastBackupDate}</p>
    <p>Tamaño: {backupSize} MB</p>
    <button on:click={triggerManualBackup}>Backup Manual</button>
  </div>
  
  <div class="backup-card">
    <h4>☁️ R2 Versioning</h4>
    <p>Estado: {versioningEnabled ? 'Habilitado ✅' : 'Deshabilitado ⚠️'}</p>
    <p>Versiones guardadas: {versionCount}</p>
  </div>
  
  <div class="backup-card">
    <h4>🗑️ Archivos Rechazados</h4>
    <p>Pendientes de limpieza: {rejectedCount}</p>
    <button on:click={cleanupRejected}>Limpiar > 30 días</button>
  </div>
</div>
```

#### E. Costo Estimado
- **Firestore Exports:** Gratis hasta 1GB/día (suficiente)
- **Google Cloud Storage:** ~$0.02/GB/mes
- **R2 Versioning:** Sin costo adicional (incluido)
- **Total Estimado:** < $5 USD/mes

#### F. Checklist de Implementación
- [ ] Crear proyecto GCP (si no existe)
- [ ] Configurar Cloud Functions para backups
- [ ] Habilitar R2 versioning en dashboard
- [ ] Implementar endpoint de rechazo con movimiento (no eliminación)
- [ ] Crear BackupsTab en admin panel
- [ ] Documentar proceso de restauración
- [ ] Testear backup y restore completo

**Prioridad:** 🔴 ALTA (protección de datos crítica)  
**Estimación:** 5-6 horas total  
**Beneficio:** Protección completa contra pérdida de datos  
**Estado:** 🟡 **PARCIALMENTE IMPLEMENTADO** (2025-12-31)

**✅ Completado:**
- BackupsTab.svelte (dashboard de monitoreo)
- API endpoint `/api/admin/cleanup-rejected` (limpieza de archivos temporales)
- API endpoint `/api/admin/trigger-backup` (placeholder documentado)
- Integración en admin panel con tab dedicado
- Documentación completa en PENDING_FIXES.md

**⏳ Pendiente (Requiere Configuración Externa):**
- [ ] Configurar Cloud Scheduler en Google Cloud Platform
- [ ] Configurar Cloud Function para backups automáticos
- [ ] Habilitar R2 versioning en Cloudflare Dashboard
- [ ] Configurar bucket GCS para almacenar backups
- [ ] Testear backup y restore completo

**Acceso:**
- Admin: `/admin` → Tab "Backups 💾"

---

## 📝 Notas de Deployment

**Última versión desplegada:** v0.7.1 (2025-12-31)

**Cambios incluidos:**
- ✅ Volumen vertical z-index fix
- ✅ Audio errors silenciados
- ✅ Documentación PROJECT_OVERVIEW.md actualizada

**Pendiente de deploy:**
- ⏳ Fix de badges en /artists (cuando se identifique causa)
- ⏳ Sistema de reportes de bugs (cuando se implemente)

---

## 🐛 Bugs Conocidos (Backlog)

1. **Volumen "fuera":** ✅ CORREGIDO
2. **Audio errors F12:** ✅ CORREGIDO
3. **Badges no visibles en /artists:** ⚠️ EN INVESTIGACIÓN
4. **[Agregar más aquí según se reporten]**

---

## 📞 Cómo Reportar Problemas

**Para usuarios:**
1. Ir a `/bugs` (cuando esté implementado)
2. Llenar formulario detallado
3. Incluir navegador y sistema operativo

**Para desarrolladores:**
1. Actualizar este archivo (PENDING_FIXES.md)
2. Crear issue en GitHub (si aplica)
3. Asignar prioridad y label

---

**Último sesión AI:** 2025-12-31 03:43 UTC

---

### 6. Renovación del Panel de Administración `/admin`
**Requisito:** Mejorar rendimiento, usabilidad y estética del panel  
**Problemas Actuales:**
- ⚠️ Rendimiento lento al cargar datos
- ⚠️ Interfaz no es cómoda de usar
- ⚠️ No mantiene la estética visual de ChillChess
- ⚠️ Falta de feedback visual en acciones
- ⚠️ Navegación no intuitiva entre tabs

**Propuestas de Mejora:**

#### A. Performance
- Implementar virtualización para listas largas (usuarios, bugs, proposals)
- Lazy loading de tabs (solo cargar datos al abrir tab)
- Paginación en lugar de cargar todo
- Debouncing en búsquedas y filtros
- Cache de datos con SWR pattern

#### B. UX/UI
- Rediseñar con glassmorphism consistente con ChillChess
- Añadir animaciones suaves
- Mejorar feedback: loaders, toasts, confirmaciones
- Sidebar fijo con navegación más clara
- Shortcuts de teclado para acciones comunes
- Dark mode mejorado con colores ChillChess

#### C. Funcionalidad
- Dashboard con métricas en tiempo real
- Búsqueda global en todo el admin
- Acciones en bulk (aprobar múltiples, etc.)
- Historial de acciones del admin (audit log)
- Exportación de datos (CSV, JSON)

**Estimación:** 12-15 horas  
**Prioridad:** 🟡 MEDIA (mejora experiencia admin, no crítico)  
**Impacto:** Alto (admins usan constantemente)

---

### 7. Optimización de `/coleccion`
**Requisito:** Mejorar rendimiento de la página de colección de álbumes  
**Problemas Actuales:**
- ⚠️ Carga lenta con muchos álbumes
- ⚠️ Renderiza todos los elementos a la vez
- ⚠️ No hay lazy loading de imágenes
- ⚠️ Búsqueda deep sin debouncing

**Soluciones Propuestas:**

#### A. Virtualización (Priority 1)
```typescript
// Usar svelte-virtual o svelte-tiny-virtual-list
import VirtualList from '@sveltejs/svelte-virtual-list';

// Renderizar solo elementos visibles en el viewport
<VirtualList items={filteredAlbums} let:item>
  <AlbumCard album={item} />
</VirtualList>
```

#### B. Lazy Loading de Imágenes
```html
<img 
  src={album.cover} 
  loading="lazy" 
  decoding="async"
  alt={album.title}
/>
```

#### C. Debouncing en Búsqueda
```typescript
import { debounce } from 'lodash-es';

const handleSearch = debounce((query) => {
  searchQuery = query;
}, 300);
```

#### D. Paginación / Infinite Scroll
- Mostrar 20 álbumes inicialmente
- Cargar más al hacer scroll (intersection observer)
- Botón "Cargar más" como fallback

**Estimación:** 3-4 horas  
**Prioridad:** 🟡 MEDIA  
**Impacto:** Alto (página muy visitada)

---
