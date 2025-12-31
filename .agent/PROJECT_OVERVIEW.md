# ChillChess - Documentación Completa del Proyecto
**Última actualización:** 2025-12-31  
**Versión:** 2.0.0 (v0.7)  
**Estado:** En producción activa

---

## 🎯 Visión General del Proyecto

**ChillChess** es una plataforma multifuncional que combina:
1. **Streaming de Música Lo-Fi/Ambient** (núcleo principal)
2. **Perfiles de Artistas Verificados** con catálogo público
3. **Sistema de Salas Compartidas** para escucha sincronizada
4. **Widget para Streamers OBS**
5. **Suscripciones Pro/Fundadores** (Stripe)
6. **Panel de Administración** integral

**URL:** [chillchess.com](https://chillchess.com)  
**Plataforma:** SvelteKit + Firebase + Cloudflare R2 + Netlify

---

## 📁 Arquitectura del Proyecto

### Stack Tecnológico

**Frontend:**
- **Framework:** SvelteKit 2.0 (TypeScript)
- **Styling:** Tailwind CSS 3.4 + Custom Design System
- **Fuentes:** Poppins (UI), Cinzel (decorativa)
- **Iconos:** Custom SVG components

**Backend/Servicios:**
- **Autenticación:** Firebase Auth (Email/Password)
- **Base de Datos:** Firestore (NoSQL)
- **Almacenamiento de Archivos:** Cloudflare R2 (S3-compatible)
- **Pagos:** Stripe (Subscripciones)
- **Hosting:** Netlify (SSR + Edge Functions)

**Audio:**
- **Reproductor:** Custom Web Audio API wrapper
- **Formatos:** MP3 (streaming), WAV (descarga Pro)
- **White Noise:** Sistema de capas de audio ambiental

---

## 🗂️ Estructura de Directorios

```
ChillChess/
├── src/
│   ├── routes/                      # Páginas y API Routes
│   │   ├── +layout.svelte          # Layout global (navbar, player)
│   │   ├── +page.svelte            # Página principal (reproductor)
│   │   ├── /admin                  # Panel de administración
│   │   ├── /artist                 # Perfil público de artista
│   │   ├── /coleccion              # Galería de álbumes
│   │   ├── /listen                 # Salas de escucha compartida
│   │   ├── /roadmap                # Hoja de ruta pública
│   │   ├── /patches                # Notas de versión
│   │   ├── /api/                   # Endpoints backend
│   │   │   ├── /r2/sign-url        # Generar URLs firmadas
│   │   │   ├── /admin/cleanup-r2   # Limpieza de archivos temp
│   │   │   └── /stripe/*           # Webhooks y checkout
│   │   └── /obs-widget             # Widget para streamers
│   │
│   ├── lib/
│   │   ├── components/             # Componentes reutilizables
│   │   │   ├── BottomPlayer.svelte        # Reproductor flotante
│   │   │   ├── ChillBackground.svelte     # Fondos animados
│   │   │   ├── FounderBadge.svelte        # Insignia de fundador
│   │   │   ├── VerifiedBadge.svelte       # Check de verificado
│   │   │   ├── /admin/                    # Componentes del panel
│   │   │   │   ├── MusicTab.svelte        # Gestión de música
│   │   │   │   ├── UsersTab.svelte        # Gestión de usuarios
│   │   │   │   ├── VerifyTab.svelte       # Verificación manual
│   │   │   │   └── SystemStatus.svelte    # Estado de servicios
│   │   │   └── /player/                   # Subcomponentes reproductor
│   │   │       ├── VolumeControl.svelte   # Control volumen vertical
│   │   │       ├── ProgressBar.svelte     # Barra de progreso
│   │   │       └── PlaybackControls.svelte
│   │   │
│   │   ├── audio/
│   │   │   ├── store.ts            # Estado global del reproductor
│   │   │   └── whiteNoise.ts       # Sistema de sonidos ambientales
│   │   │
│   │   ├── data/
│   │   │   ├── albums.ts           # Tipos y utilidades de álbumes
│   │   │   └── favorites.ts        # Store de favoritos
│   │   │
│   │   ├── server/
│   │   │   └── r2.ts               # Cliente S3 para R2
│   │   │
│   │   ├── subscription/
│   │   │   └── tiers.ts            # Definición de planes
│   │   │
│   │   └── firebase.ts             # Inicialización de Firebase
│   │
│   ├── app.html                    # Template HTML base
│   └── app.postcss                 # Estilos globales + Tailwind
│
├── .agent/                         # Documentación técnica
│   ├── PROJECT_OVERVIEW.md         # Este archivo
│   └── AI_MUSIC_GENERATION.md      # Propuesta Stable Audio
│
├── static/                         # Assets estáticos
│   ├── favicon.png
│   └── logo.svg
│
└── tailwind.config.js              # Configuración Tailwind + colores
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```css
/* Colores Primarios */
--primary-500: #f97316    /* Naranja ChillChess (marca) */
--midnight-900: #0B1120   /* Fondo oscuro principal */
--midnight-800: #141b2d   /* Cards y modales */

/* Gradientes */
bg-gradient-to-r from-primary-500 to-orange-600  /* Botones principales */
bg-gradient-to-b from-midnight-900 to-black     /* Fondos generales */
```

### Componentes Visuales
1. **Glassmorphism:** `backdrop-blur-xl` + `bg-white/5`
2. **Animaciones:** `transition-all duration-300`
3. **Sombras:** `shadow-[0_8px_32px_rgba(0,0,0,0.5)]`
4. **Bordes:** `border border-white/10`

---

## 🔥 Firebase - Estructura de Datos

### Colecciones Principales

#### **`users`** (Usuarios)
```typescript
{
  uid: string (auto),
  email: string,
  displayName: string,
  photoURL?: string,
  subscriptionTier: 'free' | 'pro',
  isVerified: boolean,           // Marca de verificación
  isAdmin: boolean,
  createdAt: number,
  updatedAt: number,
  profile?: {
    bio?: string,
    showFounderBadge?: boolean,  // Mostrar insignia fundador
    socialLinks?: {
      instagram?: string,
      twitter?: string,
      spotify?: string
    }
  }
}
```

#### **`albums`** (Álbumes Musicales)
```typescript
{
  id: string (auto),
  title: string,
  artist: string,                // Nombre de display
  artistId: string,              // UID del usuario verificado
  coverUrl: string,              // URL en R2
  category: 'musica' | 'ambient',
  tracks: [
    {
      title: string,
      url: string,               // URL en R2
      duration: number
    }
  ],
  createdAt: Timestamp,
  isApproved: boolean            // Para submissions
}
```

#### **`favorites`** (Favoritos por usuario)
```typescript
{
  userId: string,
  trackId: string,
  albumId: string,
  addedAt: Timestamp
}
```

#### **`submissions`** (Envíos de música pendientes)
```typescript
{
  id: string,
  userId: string,
  artistName: string,
  albumTitle: string,
  coverUrl: string,
  tracks: Track[],
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: Timestamp,
  reviewedAt?: Timestamp,
  reviewedBy?: string (adminUID)
}
```

#### **`listenRooms`** (Salas de Escucha Compartida)
```typescript
{
  id: string,
  name: string,
  hostId: string,
  isPublic: boolean,
  currentTrack: {
    albumId: string,
    trackIndex: number,
    playbackPosition: number,
    isPlaying: boolean,
    updatedAt: Timestamp
  },
  participants: string[],        // Array de UIDs
  createdAt: Timestamp
}
```

---

## ☁️ Cloudflare R2 - Estructura de Almacenamiento

### Buckets y Prefijos

**Bucket Principal:** `chillchess-music`

```
chillchess-music/
├── albums/
│   ├── {albumId}/
│   │   ├── cover.jpg
│   │   └── tracks/
│   │       ├── 01-{title}.mp3
│   │       └── 02-{title}.mp3
│
├── submissions/
│   ├── temp/                   # Archivos temporales (limpieza automática)
│   └── approved/
│
├── avatars/
│   └── {userId}.jpg
│
└── generated/                  # Futuro: música generada por IA
```

### URLs Públicas
- **Producción:** `https://pub-{account}.r2.dev/{path}`
- **Firmadas (upload):** Generadas por `/api/r2/sign-url`

---

## 🎵 Sistema de Reproducción de Audio

### Audio Store (`$lib/audio/store.ts`)

**Estado Global:**
```typescript
{
  playlist: Album[],
  currentTrackIndex: number,
  isPlaying: boolean,
  currentTime: number,
  duration: number,
  musicVolume: number,          // 0-1
  isMuted: boolean,
  isShuffling: boolean,
  whiteNoise: {
    rain: number,               // Volumen 0-1
    fire: number,
    cafe: number,
    ocean: number,
    forest: number
  }
}
```

**Funciones Principales:**
- `loadAlbum(album)` - Cargar álbum completo
- `playTrack(index)` - Reproducir pista específica
- `togglePlay()` - Play/Pausa
- `nextTrack()` / `previousTrack()`
- `seek(time)` - Saltar a posición
- `setMusicVolume(vol)`
- `setWhiteNoiseVolume(type, vol)`

### Componentes del Reproductor

1. **`BottomPlayer.svelte`** (Contenedor principal)
   - Flotante en parte inferior
   - Z-index: 100 (siempre visible)
   - Estados: Collapsed (mini) / Expanded (completo)
   - Cerrable (pausa + oculta)

2. **`VolumeControl.svelte`**
   - Slider **vertical** desplegable al hover
   - Posición: `bottom-full` (hacia arriba)
   - Color: `bg-primary-500` (naranja)
   - Z-index: 50 (encima del reproductor)

3. **`ProgressBar.svelte`**
   - Barra horizontal con tiempos
   - Click para seek
   - Color activo: `bg-primary-500`
   - Handle visible en hover

---

## 👑 Sistema de Roles y Permisos

### Niveles de Acceso

| Rol | Capacidades |
|-----|-------------|
| **Free** | Acceso limitado al catálogo, 3 partidas/día (future), sin descargas |
| **Pro** | Catálogo completo, descargas WAV, Artist Hub, sin límites |
| **Fundador** | Pro + Insignia especial (rombo púrpura 💎), acceso early |
| **Verificado** | Badge dorado ✓, música asignada a perfil público |
| **Admin** | Acceso total a `/admin`, gestión de usuarios/música/submissions |

### Verificación
- **Marca:** `users.isVerified = true`
- **Asignación:** Manual desde `/admin` → Verify Tab
- **Efecto:** Badge en perfil + aparece en selector de artistas

---

## 🛠️ Panel de Administración (`/admin`)

### Tabs Disponibles

#### 1. **Music** (Gestión de Música)
- Upload masivo de álbumes (cover + tracks)
- Selector de artista verificado con distintivo Fundador 💎
- Preview de tracks
- Eliminación de álbumes
- Búsqueda y filtrado

#### 2. **Users** (Gestión de Usuarios)
- Lista completa de usuarios
- Cambio de tier (Free → Pro)
- Bloqueo/desbloqueo
- Búsqueda por email/nombre

#### 3. **Verify** (Verificación Manual)
- Toggle verificado/no verificado
- Asignar permisos de Admin
- Filtrado por estado
- Historial de cambios

#### 4. **Submissions** (Envíos Pendientes)
- Aprobar/rechazar submissions de artistas
- Preview de música enviada
- Asignación automática o manual de artista
- Migración a catálogo principal

#### 5. **System Status** (Estado del Sistema)
- Conexión Firebase (verde/rojo)
- Conexión R2 (verde/rojo)
- Botón de limpieza de archivos temporales
- Optimizado para móvil (abreviaciones)

### Funcionalidades Especiales

**Limpieza Automática R2:**
- Endpoint: `POST /api/admin/cleanup-r2`
- Acción: Elimina archivos en `submissions/temp/` > 3 días
- Trigger: Manual desde SystemStatus

**Upload Workflow:**
1. Usuario selecciona artista de lista de verificados
2. Sube cover (JPG/PNG) + tracks (MP3/WAV)
3. Genera URLs firmadas para R2
4. Sube archivos directamente a R2
5. Guarda metadata en Firestore
6. Actualiza catálogo en tiempo real

---

## 🎨 Fondos Dinámicos (`ChillBackground.svelte`)

### Tipos Disponibles

1. **Gradient** - Gradientes animados suaves
2. **Particles** - Partículas flotantes
3. **Waves** - Ondas sinusoidales
4. **Rain** - Lluvia animada
5. **Cyber** - Grid ciberpunk
6. **Zen** - Círculos concéntricos zen

**Configuración:**
- Solo usuarios Pro pueden cambiar fondo
- Persistencia en `localStorage`
- Cambio en tiempo real sin reload

---

## 🔐 Variables de Entorno Críticas

```bash
# Firebase
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=

# Cloudflare R2
PUBLIC_R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=chillchess-music

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# URLs
PUBLIC_BASE_URL=https://chillchess.com
```

---

## 🚀 Deployment

### Plataforma: Netlify

**Build Settings:**
```bash
Build Command: npm run build
Publish Directory: build
Node Version: 18.x
```

**Adapter:** `@sveltejs/adapter-netlify`

**Edge Functions:**
- Todas las rutas API se ejecutan en Edge
- SSR habilitado para rutas dinámicas (`/artist`, `/admin`)

### CI/CD
- **Trigger:** Push a `main` branch en GitHub
- **Pre-deploy:** `svelte-kit sync` + TypeScript check
- **Post-deploy:** Limpieza de cache de Netlify

---

## 📊 Roadmap Actual (v0.7)

### ✅ Completado Recientemente
- Panel de Admin 2.0 (móvil-friendly)
- Sistema de Artistas + Fundadores
- Salas de escucha compartida
- Widget OBS para streamers
- White Noise (sonidos ambientales)
- Reproductor vertical (volumen)
- Cleanup automático R2

### 🔄 En Desarrollo
- Expansión del catálogo musical
- Mejoras en el reproductor (shuffle, repeat, speed)

### 📦 Planeado
- Playlists personalizadas
- Modo offline (PWA)
- Estadísticas de escucha
- Temas de color
- App móvil nativa (2026)
- [PROPUESTO] Generación de música con IA (Stable Audio)

---

## 🐛 Problemas Conocidos y Soluciones

### Volumen Vertical Cortado
**Síntoma:** Slider de volumen no visible / cortado  
**Causa:** `overflow-hidden` en contenedor padre  
**Solución:** Separar capa de fondo y contenido en `BottomPlayer.svelte`

### TypeScript: $env/dynamic/private no encontrado
**Síntoma:** Errores de tipos en imports de env  
**Solución:** `npx svelte-kit sync` para regenerar tipos

### Firestore: Missing Index
**Síntoma:** Query falla en producción  
**Solución:** Crear índice compuesto desde Firebase Console (enlace en error)

### R2 Upload Falla
**Síntoma:** Pre-signed URL rechazada / 403  
**Causa:** Credenciales incorrectas o expiradas  
**Solución:** Verificar env vars y regenerar Access Keys si es necesario

---

## 📱 Responsive Design - Breakpoints

```css
/* Mobile First */
default: 0-640px       (sm viewport)
md: 640px+            (tablet)
lg: 1024px+           (desktop)
xl: 1280px+           (large desktop)
```

### Adaptaciones Clave
- Admin tables: Stack vertical en móvil
- Reproductor: Ocultar volume control en < lg
- Navbar: Hamburger menu en < md
- Cards de álbumes: Grid 1 → 2 → 3 → 4 cols

---

## 🧪 Testing y QA

### Checklist antes de Deploy

- [ ] Reproductor funciona (play/pause/seek)
- [ ] Volume control visible y funcional
- [ ] Admin login funciona
- [ ] Upload de música OK (cover + tracks)
- [ ] Verificación de usuarios OK
- [ ] Stripe checkout funciona
- [ ] Responsividad en móvil
- [ ] Sin errores de consola

### Comandos Útiles
```bash
# Desarrollo local
npm run dev

# Verificar tipos
npm run check

# Build de producción (test)
npm run build && npm run preview
```

---

## 🤝 Contribución y Mantenimiento

### Para Futuras Sesiones de IA

**¿Qué revisar primero?**
1. Leer este archivo (`PROJECT_OVERVIEW.md`)
2. Ver `package.json` para dependencias
3. Revisar últimas Patch Notes en `/patches`
4. Comprobar estado de issues conocidos

**Archivos Críticos (No Tocar Sin Contexto):**
- `src/lib/audio/store.ts` - Estado global del reproductor
- `src/lib/firebase.ts` - Configuración Firebase
- `src/lib/server/r2.ts` - Cliente R2
- `tailwind.config.js` - Sistema de diseño

**Convenciones de Código:**
- TypeScript estricto
- Componentes Svelte 4
- Tailwind para estilos (sin CSS inline)
- Stores reactivos para estado compartido
- API Routes en `+server.ts`

---

## 📞 Contacto y Recursos

**GitHub:** [Enlace al repo]  
**Discord:** [discord.gg/G7SrFtJHnr](https://discord.gg/G7SrFtJHnr)  
**Documentación Externa:**
- [SvelteKit Docs](https://kit.svelte.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [R2 API Reference](https://developers.cloudflare.com/r2/)

---

**Última Modificación:** 2025-12-31 02:51 UTC  
**Mantenido por:** Antigravity AI + ChillChess Dev Team
