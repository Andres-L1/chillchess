# 🤝 Guía de Contribución - ChillChess

¡Gracias por tu interés en contribuir a ChillChess! Esta guía te ayudará a mantener la calidad y consistencia del código.

---

## 📋 Antes de Empezar

### Requisitos

- **Node.js 18+**
- **npm 9+**
- **Git**
- Cuenta de Firebase (para desarrollo)

### Setup Inicial

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/chillchess.git
cd chillchess

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Firebase

# Ejecutar en desarrollo
npm run dev
```

---

## 🎯 Tipos de Contribuciones

### 🐛 Reportar Bugs

1. Verifica que el bug no esté ya reportado en `/bugs` o GitHub Issues
2. Usa la página `/bugs` de la app o crea un issue en GitHub
3. Incluye:
   - Descripción clara del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Navegador y sistema operativo
   - Screenshots si aplica

### ✨ Proponer Features

1. Revisa primero la sección `/proposals` de la app
2. Describe claramente:
   - Qué problema resuelve
   - Cómo funcionaría
   - Por qué es importante
3. Espera feedback del equipo antes de implementar

### 💻 Contribuir Código

1. **Fork** el repositorio
2. Crea una **branch** desde `main`:
   ```bash
   git checkout -b feature/nombre-descriptivo
   # o
   git checkout -b fix/nombre-del-bug
   ```
3. Haz tus cambios siguiendo las convenciones
4. **Commit** con mensajes descriptivos
5. **Push** tu branch
6. Abre un **Pull Request**

---

## 📝 Convenciones de Código

### Estructura de Archivos

```
src/
├── lib/
│   ├── components/     # Componentes reutilizables
│   ├── types/          # Tipos TypeScript compartidos
│   ├── utils/          # Utilidades (logger, validators, formatters)
│   ├── constants/      # Constantes de la app
│   └── ...
├── routes/             # Páginas SvelteKit
└── app.d.ts           # Tipos globales
```

### Naming Conventions

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componentes Svelte | PascalCase | `UserProfile.svelte` |
| Archivos TypeScript | camelCase | `validators.ts` |
| Funciones | camelCase | `formatDate()` |
| Constantes | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Tipos/Interfaces | PascalCase | `User`, `BugReport` |
| CSS Classes | kebab-case | `user-profile` |

### TypeScript

**✅ Hacer:**
```typescript
// Tipar props explícitamente
export let user: User | null;

// Tipar parámetros y retornos
function processData(input: string): number {
    return parseInt(input);
}

// Usar tipos compartidos
import type { BugReport } from '$lib/types';
```

**❌ Evitar:**
```typescript
// No usar 'any'
function process(data: any) { } // ❌

// No omitir tipos obvios
export let user; // ❌
let count; // ❌
```

### Componentes Svelte

**Estructura Estándar:**

```svelte
<script lang="ts">
    // 1. Imports
    import { onMount } from 'svelte';
    import { logger } from '$lib/utils/logger';
    
    // 2. Types
    import type { User } from '$lib/types';
    
    // 3. Props
    export let user: User;
    export let onSave: (data: User) => void;
    
    // 4. Local State
    let isEditing = false;
    let formData = { ...user };
    
    // 5. Reactive Statements
    $: canSave = formData.name.length > 0;
    
    // 6. Functions
    function handleSubmit() {
        logger.info('User saved', { userId: user.id });
        onSave(formData);
    }
    
    // 7. Lifecycle
    onMount(() => {
        logger.debug('Component mounted');
    });
</script>

<div class="user-profile">
    <!-- Template -->
</div>

<style>
    /* Scoped styles */
</style>
```

### Logging

**Usa el logger centralizado:**

```typescript
import { logger } from '$lib/utils/logger';

// Debug (solo dev)
logger.debug('Detailed info', { context });

// Info (operaciones normales)
logger.info('User logged in', { userId });

// Warn (advertencias)
logger.warn('Rate limit approaching', { requests });

// Error (errores críticos)
logger.error('Failed to load data', error, { userId });
```

### Manejo de Errores

**Try-Catch + Logging:**

```typescript
try {
    await saveToDatabase(data);
    logger.info('Data saved successfully');
} catch (error) {
    logger.error('Failed to save data', error, { 
        operation: 'saveToDatabase',
        data 
    });
    // Mostrar mensaje al usuario
    alert('Error al guardar. Intenta de nuevo.');
}
```

### Validación

**Usa validadores compartidos:**

```typescript
import { 
    validateBugTitle, 
    validateBugDescription 
} from '$lib/utils/validators';

const titleValidation = validateBugTitle(title);
if (!titleValidation.valid) {
    alert(titleValidation.error);
    return;
}
```

### Constantes

**Usa constantes definidas:**

```typescript
import { COLLECTIONS, LIMITS, ROUTES } from '$lib/constants';

// ✅ Hacer
const bugsRef = collection(db, COLLECTIONS.BUG_REPORTS);
if (title.length > LIMITS.BUG_TITLE_MAX) { /* ... */ }

// ❌ Evitar
const bugsRef = collection(db, 'bug_reports'); // ❌
if (title.length > 100) { /* ... */ } // ❌
```

---

## 🎨 Estilos y UI

### Glassmorphism Theme

Mantén la estética consistente:

```svelte
<!-- Contenedores principales -->
<div class="bg-[#131b2e]/60 backdrop-blur-xl border border-white/10 rounded-2xl">

<!-- Botones primarios -->
<button class="bg-primary-500 hover:bg-primary-600 text-white rounded-xl">

<!-- Inputs -->
<input class="bg-white/5 border border-white/10 rounded-xl text-white">
```

### Colores

Usa las variables del tema:

```typescript
import { THEME_COLORS } from '$lib/constants';

// En Tailwind
bg-[#0B1120]      // Background
bg-[#131b2e]      // Surface
text-primary-500  // Primary (#FF7B3D)
```

### Responsividad

Usa breakpoints de Tailwind:

```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
```

---

## ✅ Checklist Pre-Commit

Antes de hacer commit, verifica:

- [ ] **TypeScript:** Sin errores de tipo
- [ ] **Lint:** Código pasa ESLint
- [ ] **Format:** Código formateado con Prettier
- [ ] **Imports:** Ordenados correctamente
- [ ] **Logger:** Usa `logger` en lugar de `console.log`
- [ ] **Constantes:** No hay magic numbers/strings
- [ ] **Validación:** Input validado antes de usar
- [ ] **Tipos:** Todo está correctamente tipado
- [ ] **Comentarios:** Funciones complejas documentadas
- [ ] **Error Handling:** Try-catch donde sea necesario

---

## 📦 Commits

### Formato de Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>: <descripción>

[cuerpo opcional]

[footer opcional]
```

**Tipos:**
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `refactor:` Refactorización sin cambio funcional
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan funcionalidad)
- `perf:` Mejoras de rendimiento
- `test:` Añadir o modificar tests
- `chore:` Cambios en build, CI, etc.

**Ejemplos:**

```bash
# Bueno ✅
git commit -m "feat: add volume control to music player"
git commit -m "fix: resolve issue with dropdown closing on mobile"
git commit -m "refactor: centralize validation logic"

# Malo ❌
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "WIP"
```

---

## 🧪 Testing (Futuro)

Actualmente no tenemos tests automatizados, pero es una prioridad. Cuando se implemente:

- **Unit tests:** Vitest
- **Component tests:** Testing Library
- **E2E tests:** Playwright

---

## 🚀 Pull Requests

### Título

Describe claramente qué hace el PR:

```
✅ "Add user profile editing functionality"
✅ "Fix dropdown menu not closing on mobile"
❌ "Update files"
❌ "Changes"
```

### Descripción

Incluye:

1. **Qué** cambia este PR
2. **Por qué** es necesario
3. **Cómo** lo implementaste
4. Screenshots (si es UI)
5. Pasos para probar

**Template:**

```markdown
## Descripción
Añade funcionalidad de edición de perfil de usuario.

## Motivación
Los usuarios necesitan poder actualizar su nombre y avatar.

## Cambios
- Añadido formulario de edición en `/profile`
- Creado endpoint `/api/user/update`
- Validación de inputs con `validators.ts`

## Screenshots
[Adjuntar imagen]

## Testing
1. Ir a `/profile`
2. Hacer clic en "Editar Perfil"
3. Cambiar nombre y guardar
4. Verificar que se actualiza en Firestore
```

### Review Process

1. El equipo revisará tu PR
2. Puede haber comentarios/sugerencias
3. Haz los cambios solicitados
4. Una vez aprobado, se hará merge

---

## 🆘 Ayuda

¿Tienes dudas?

- **Documentación:** Lee `ARCHITECTURE.md`
- **Issues:** Abre un issue en GitHub
- **Contacto:** [correo del equipo]

---

## 📜 Licencia

Al contribuir, aceptas que tu código se licencie bajo la misma licencia del proyecto.

---

¡Gracias por hacer ChillChess mejor! 🎉
