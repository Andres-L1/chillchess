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

**Mantenido por:** ChillChess Dev Team  
**Última sesión AI:** 2025-12-31 03:11 UTC
