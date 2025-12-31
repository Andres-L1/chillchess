# 🏗️ ChillChess - Arquitectura del Proyecto

> **Última actualización:** 31 de Diciembre de 2024

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura de Componentes](#arquitectura-de-componentes)
5. [Gestión de Estado](#gestión-de-estado)
6. [Sistema de Logging](#sistema-de-logging)
7. [Manejo de Errores](#manejo-de-errores)
8. [Convenciones de Código](#convenciones-de-código)

---

## 🎯 Visión General

ChillChess es una aplicación web de ajedrez con streaming de música relajante, construida con SvelteKit y Firebase. La arquitectura se centra en:

- **Modularidad:** Componentes reutilizables y funciones compartidas
- **Type Safety:** TypeScript estricto en toda la aplicación
- **Escalabilidad:** Estructura preparada para crecer
- **Mantenibilidad:** Código documentado y bien organizado
- **Performance:** Optimizaciones de carga y renderizado

---

## 📁 Estructura de Carpetas

```
src/
├── lib/
│   ├── auth/                    # Autenticación y manejo de usuarios
│   │   ├── userStore.ts         # Svelte store para el usuario actual
│   │   └── firebase.ts          # Configuración de Firebase Auth
│   │
│   ├── audio/                   # Sistema de reproducción de música
│   │   ├── store.ts             # State del reproductor
│   │   └── player.ts            # Lógica de reproducción
│   │
│   ├── components/              # Componentes Svelte reutilizables
│   │   ├── admin/               # Componentes del panel admin
│   │   ├── icons/               # Componentes de iconos
│   │   ├── player/              # Componentes del reproductor
│   │   └── ErrorBoundary.svelte # Manejo de errores global
│   │
│   ├── types/                   # Definiciones TypeScript centralizadas
│   │   └── index.ts             # Todas las interfaces y tipos
│   │
│   ├── constants/               # Constantes de la aplicación
│   │   └── index.ts             # Valores configurables
│   │
│   ├── utils/                   # Utilidades compartidas
│   │   ├── logger.ts            # Sistema de logging
│   │   ├── validators.ts        # Funciones de validación
│   │   ├── formatters.ts        # Formateo de datos
│   │   └── debounce.ts          # Helpers de temporización
│   │
│   ├── actions/                 # Svelte actions
│   │   └── clickOutside.ts      # Acción para detectar clicks externos
│   │
│   └── firebase.ts              # Configuración central de Firebase
│
├── routes/                      # Páginas de la aplicación (SvelteKit)
│   ├── +layout.svelte           # Layout principal
│   ├── +page.svelte             # Página de inicio
│   ├── admin/                   # Panel de administración
│   ├── artists/                 # Página de artistas
│   ├── bugs/                    # Sistema de reporte de bugs
│   ├── coleccion/               # Colección de álbumes
│   └── proposals/               # Propuestas de la comunidad
│
└── app.d.ts                     # Definiciones de tipos globales
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **SvelteKit 2.x** - Framework principal
- **TypeScript 5.x** - Tipado estático
- **TailwindCSS 3.x** - Estilos (Glassmorphism)
- **Vite** - Build tool

### Backend & Servicios
- **Firebase Authentication** - Gestión de usuarios
- **Firestore** - Base de datos NoSQL
- **Cloudflare R2** - Almacenamiento de archivos (música, imágenes)
- **Firebase Functions** - Serverless backend (futuro)

### Librerías Clave
- `chess.js` - Lógica del juego de ajedrez
- `cm-chessboard` - Componente visual del tablero
- `firebase` - SDK de Firebase

---

## 🧩 Arquitectura de Componentes

### Principios de Diseño de Componentes

1. **Componentes Presentacionales vs Contenedores**
   - **Presentacionales:** Solo reciben props y emiten eventos
   - **Contenedores:** Gestionan estado y lógica

2. **Composición sobre Herencia**
   - Usar slots para crear componentes flexibles
   - Evitar jerarquías profundas de componentes

3. **Props & Events**
   ```svelte
   <script lang="ts">
       export let title: string;
       export let onSave: (data: any) => void;
   </script>
   ```

### Componentes Clave

#### `ErrorBoundary.svelte`
Envuelve componentes para capturar errores sin romper la app.

```svelte
<ErrorBoundary>
    <YourComponent />
</ErrorBoundary>
```

#### `BottomPlayer.svelte`
Reproductor de música persistente en la parte inferior.

#### `VolumeControl.svelte`
Control de volumen horizontal expandible.

---

## 📊 Gestión de Estado

### Svelte Stores

Usamos **Svelte Stores** para el estado global:

```typescript
// src/lib/auth/userStore.ts
import { writable } from 'svelte/store';

export const userStore = writable({
    user: null,
    loading: true
});
```

**Stores Principales:**
- `userStore` - Usuario autenticado
- `audioStore` - Estado del reproductor de música

### Estado Local

Para estado de componente, usar variables reactivas:

```svelte
<script lang="ts">
    let isOpen = false;
    let items = [];
    
    $: filteredItems = items.filter(/* ... */);
</script>
```

---

## 📝 Sistema de Logging

### Uso del Logger

```typescript
import { logger } from '$lib/utils/logger';

// Niveles de log
logger.debug('Información de depuración', { data });
logger.info('Operación exitosa', { userId });
logger.warn('Advertencia', { reason });
logger.error('Error crítico', error, { context });
```

### Logger Contextual

Para componentes específicos:

```typescript
import { createContextLogger } from '$lib/utils/logger';

const log = createContextLogger('MusicPlayer');
log.info('Reproduciendo track', { trackId });
```

### Configuración

- **Dev:** Muestra todos los logs con colores
- **Prod:** Solo WARN y ERROR, enviados a servicio externo (TODO)

---

## ⚠️ Manejo de Errores

### Error Boundary

Envuelve rutas críticas:

```svelte
<!-- routes/+layout.svelte -->
<ErrorBoundary>
    <slot />
</ErrorBoundary>
```

### Try-Catch con Logging

```typescript
try {
    await riskyOperation();
} catch (error) {
    logger.error('Operation failed', error, { 
        operation: 'riskyOperation' 
    });
    // Mostrar UI de error al usuario
}
```

### Validación de Datos

Usa validadores antes de operaciones:

```typescript
import { validateBugTitle } from '$lib/utils/validators';

const validation = validateBugTitle(title);
if (!validation.valid) {
    alert(validation.error);
    return;
}
```

---

## 📐 Convenciones de Código

### Nomenclatura

- **Archivos:** `camelCase.ts`, `PascalCase.svelte`
- **Componentes:** `PascalCase`
- **Variables:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Tipos/Interfaces:** `PascalCase`

### Imports

Orden de imports:

```typescript
// 1. Módulos externos
import { onMount } from 'svelte';
import { collection } from 'firebase/firestore';

// 2. Tipos
import type { User, BugReport } from '$lib/types';

// 3. Módulos internos
import { logger } from '$lib/utils/logger';
import { COLLECTIONS } from '$lib/constants';

// 4. Componentes
import ErrorBoundary from '$lib/components/ErrorBoundary.svelte';
```

### Tipado

**Siempre tipar:**
- Props de componentes
- Parámetros de funciones
- Valores de retorno
- Variables cuando TypeScript no pueda inferir

```typescript
export let user: User | null;

function processData(input: string): number {
    // ...
}
```

### Comentarios

Usa **JSDoc** para funciones públicas:

```typescript
/**
 * Formats a duration in seconds to MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "3:45")
 */
export function formatDuration(seconds: number): string {
    // ...
}
```

### Estructura de Componentes Svelte

```svelte
<script lang="ts">
    // 1. Imports
    import { onMount } from 'svelte';
    
    // 2. Types
    interface Props { /* ... */ }
    
    // 3. Props
    export let title: string;
    
    // 4. State
    let isLoading = false;
    
    // 5. Reactive statements
    $: uppercaseTitle = title.toUpperCase();
    
    // 6. Functions
    function handleClick() { /* ... */ }
    
    // 7. Lifecycle
    onMount(() => { /* ... */ });
</script>

<!-- Template -->
<div>
    {title}
</div>

<!-- Scoped styles -->
<style>
    div {
        /* ... */
    }
</style>
```

---

## 🚀 Mejores Prácticas

### Performance

1. **Lazy Loading:**
   ```typescript
   const { db } = await import('$lib/firebase');
   ```

2. **Debouncing:**
   ```typescript
   import { debounce } from '$lib/utils/debounce';
   const handleSearch = debounce((query) => { /* ... */ }, 300);
   ```

3. **Paginación:**
   - Usa `PAGINATION.DEFAULT_PAGE_SIZE` de constants
   - Implementa infinite scroll para listas largas

### Seguridad

1. **Sanitización:**
   ```typescript
   import { sanitizeInput } from '$lib/utils/validators';
   const clean = sanitizeInput(userInput);
   ```

2. **Firestore Rules:**
   - Todas las reglas están en `firestore.rules`
   - Validar datos en el cliente Y en las reglas

3. **Autenticación:**
   - Verificar `$userStore.user` antes de operaciones sensibles
   - Usar guards de ruta en `+page.server.ts` cuando sea necesario

---

## 🔄 Flujo de Datos

```
Usuario → Componente → Validator → Firebase → Logger
                ↓
            UI Update
```

1. Usuario interactúa con UI
2. Componente valida input
3. Si válido, envía a Firebase
4. Firebase responde
5. Logger registra operación
6. UI se actualiza vía stores reactivos

---

## 📚 Recursos Adicionales

- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🤝 Contribución

Ver `CONTRIBUTING.md` para guías de contribución.

---

**Mantenido por:** Equipo ChillChess  
**Última revisión:** 2024-12-31
