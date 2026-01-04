# Guía de Optimización de Rendimiento - ChillChess

## 🎯 Objetivo
Mantener la puntuación de Lighthouse Performance > 90 mientras la app crece.

## 📦 Code Splitting Automático

### Vite Configuration (`vite.config.js`)
El proyecto ahora divide automáticamente el código en chunks optimizados:

- **firebase-auth**: Módulo de autenticación (solo carga al hacer login)
- **firebase-firestore**: Base de datos (lazy loaded)
- **firebase-storage**: Almacenamiento (solo rutas de subida)
- **admin-panel**: Todo el panel de administración (ruta `/admin`)
- **artist-submit**: Formulario de subida de música (ruta `/artist/submit`)
- **proposals**: Sistema de propuestas comunitarias
- **vendor**: Librerías de terceros compartidas

### ✅ Buenas Prácticas

#### 1. Usar Lazy Loading para Firebase
**❌ MAL** (Carga Firebase al inicio):
```typescript
import { db, auth } from '$lib/firebase';
```

**✅ BIEN** (Carga solo cuando se necesita):
```typescript
import { loadAuth, loadDb } from '$lib/utils/lazyFirebase';

async function handleLogin() {
    const auth = await loadAuth();
    // ... usar auth
}
```

#### 2. Lazy Loading de Componentes Pesados
**❌ MAL**:
```svelte
<script>
import HeavyComponent from '$lib/components/HeavyComponent.svelte';
</script>
```

**✅ BIEN**:
```svelte
<script>
let HeavyComponent;
onMount(async () => {
    HeavyComponent = (await import('$lib/components/HeavyComponent.svelte')).default;
});
</script>

{#if HeavyComponent}
    <svelte:component this={HeavyComponent} />
{/if}
```

#### 3. Imágenes Optimizadas
Siempre usar:
```html
<img 
    src="..." 
    alt="..." 
    loading="lazy" 
    decoding="async"
    width="..." 
    height="..."
/>
```

#### 4. Preconnect a Dominios Externos
En `app.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="dns-prefetch" href="https://apis.google.com">
```

## 🚀 Caché de Netlify

### Configuración Actual (`netlify.toml`)
- **JS/CSS**: 1 año de caché (immutable)
- **Fuentes**: 1 año de caché
- **Imágenes**: 1 semana de caché
- **HTML**: Sin caché (siempre fresco)

### Importante
Los archivos en `/_app/immutable/` son versionados automáticamente por SvelteKit.
Nunca necesitas invalidar este caché manualmente.

## 📊 Métricas a Vigilar

### Web Vitals Objetivo
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **FCP** (First Contentful Paint): < 1.8s
- **TTI** (Time to Interactive): < 3.8s

### Herramientas de Medición
1. **Lighthouse CI** (integrado en Netlify)
2. **Chrome DevTools** → Performance tab
3. **WebPageTest.org** para análisis avanzado

## 🔍 Debugging de Bundles

Analizar tamaño de chunks:
```bash
npm run build
npx vite-bundle-visualizer
```

## 📝 Checklist Pre-Deploy

- [ ] Ejecutar `npm run build` localmente sin errores
- [ ] Revisar tamaño de chunks en la consola
- [ ] Verificar que no hay imports directos de Firebase en la landing page
- [ ] Probar en modo incógnito (sin caché)
- [ ] Lighthouse score > 90 en todas las métricas

## 🆘 Si el Performance Score Baja

1. **Identificar el chunk pesado** con el tree map de Lighthouse
2. **Revisar imports** en rutas críticas (`+page.svelte`, `+layout.svelte`)
3. **Lazy load** componentes/módulos que no sean críticos
4. **Considerar** mover funcionalidad pesada a rutas separadas

## 🎓 Recursos Adicionales

- [SvelteKit Docs - Performance](https://kit.svelte.dev/docs/performance)
- [Vite Code Splitting](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Web Vitals Guide](https://web.dev/vitals/)
