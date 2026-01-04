# ChillChess - Documentación para Desarrolladores

> **⚠️ Este documento es privado y contiene información técnica del proyecto.**

## 🛠️ Tech Stack

Arquitectura "Zero Cost & High Speed".

*   **Frontend**: SvelteKit (Rendering & State)
*   **UI/UX**: TailwindCSS + Glassmorphism Design
*   **Backend**: Firebase (Auth, Firestore, Functions)
*   **Storage**: Cloudflare R2 (Audio Hosting)
*   **Deployment**: Netlify (CI/CD)
*   **Workers**: Cloudflare Workers (Notificaciones, Procesamiento)

## 📚 Documentación Interna

- **[Arquitectura del Proyecto](../.agent/ARCHITECTURE.md)** - Estructura, convenciones y mejores prácticas
- **[Guía de Contribución](../.agent/CONTRIBUTING.md)** - Cómo contribuir al proyecto
- **[Tareas Pendientes](../.agent/PENDING_FIXES.md)** - Bugs conocidos y features por implementar
- **[Estado de Features](../FEATURES_STATUS.md)** - Resumen de funcionalidades implementadas
- **[Security Audit](../SECURITY_AUDIT.md)** - Auditoría de seguridad
- **[Platform Audit](../PLATFORM_AUDIT.md)** - Auditoría de plataforma

## 🚀 Development Setup

### Requisitos
*   Node.js 18+
*   npm 9+
*   Cuenta de Firebase (con proyecto configurado)
*   Cuenta de Cloudflare (para R2 y Workers)
*   Cuenta de Stripe (para pagos)

### Variables de Entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```bash
# Firebase Client
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin (Server)
FB_PROJECT_ID=
FB_CLIENT_EMAIL=
FB_PRIVATE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
PUBLIC_R2_PUBLIC_URL=

# Stripe
STRIPE_SECRET_KEY=
PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Workers
WORKER_JWT_SECRET=
```

### Instalación

```bash
# Clonar repositorio (si no lo has hecho)
git clone [REPOSITORIO_PRIVADO]
cd chillchess

# Instalar dependencias
npm install

# Configurar herramientas de desarrollo
npm run prepare

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales
```

### Ejecutar Localmente

```bash
# Modo desarrollo (hot reload)
npm run dev

# Verificar tipos y sintaxis
npm run check

# Ejecutar linter
npm run lint

# Build de producción local
npm run build

# Preview del build
npm run preview
```

## 🏗️ Estructura del Proyecto

```
chillchess/
├── .agent/                  # Documentación interna y workflows
├── .github/                 # Configuración GitHub Actions (workflows, etc.)
├── build/                   # Build de producción (generado)
├── functions/               # Firebase Cloud Functions
├── src/
│   ├── lib/
│   │   ├── components/      # Componentes Svelte reutilizables
│   │   │   ├── admin/       # Componentes del panel admin
│   │   │   └── icons/       # Iconos SVG
│   │   ├── types/           # Tipos TypeScript compartidos
│   │   ├── utils/           # Logger, validators, formatters
│   │   ├── constants/       # Constantes de la app
│   │   ├── auth/            # Sistema de autenticación
│   │   ├── audio/           # Sistema de reproducción de audio
│   │   ├── subscription/    # Gestión de suscripciones
│   │   ├── server/          # Código server-side (R2, Admin)
│   │   └── validation/      # Schemas de validación (Zod)
│   ├── routes/              # Páginas y API routes de SvelteKit
│   │   ├── api/             # Endpoints de API
│   │   ├── admin/           # Panel de administración
│   │   ├── artist/          # Páginas de artistas
│   │   └── ...
│   ├── app.html             # HTML base
│   ├── app.postcss          # Estilos globales
│   └── app.d.ts             # Tipos globales
├── static/                  # Assets estáticos (música, imágenes)
├── workers/                 # Cloudflare Workers
├── .env.example             # Plantilla de variables de entorno
├── firebase.json            # Configuración Firebase
├── firestore.rules          # Reglas de seguridad Firestore
├── netlify.toml             # Configuración de Netlify
├── wrangler.toml            # Configuración de Cloudflare Workers
└── package.json             # Dependencias del proyecto
```

Ver [ARCHITECTURE.md](../.agent/ARCHITECTURE.md) para detalles completos.

## 🗺️ Roadmap Interno

### Completado ✅
- [x] **Core Player**: Reproducción continua, control de volumen, metadata
- [x] **Atmósferas**: Sistema de mezcla de White Noise
- [x] **OBS Widget**: Overlay para streamers
- [x] **Social**: Salas de escucha compartida
- [x] **Admin Panel**: Gestión de música y usuarios
- [x] **Stripe Integration**: Sistema de pagos
- [x] **R2 Storage**: Hosting de audio en Cloudflare
- [x] **Firebase Auth**: Autenticación completa
- [x] **Notificaciones**: Sistema de recordatorios locales

### En Desarrollo 🚧
- [ ] **Tracker de Productividad**: Análisis de sesiones de trabajo
- [ ] **Analytics Dashboard**: Métricas para artistas
- [ ] **API Pública**: Endpoints para integraciones

### Futuro 🔮
- [ ] **Apps Nativas**: Desktop (Electron/Tauri) y Mobile (React Native)
- [ ] **Modo TV**: Interfaz optimizada para pantallas grandes
- [ ] **AI Music Recommendations**: Recomendaciones basadas en IA
- [ ] **Collaborative Playlists**: Listas colaborativas

## 🔐 Seguridad

- **Firestore Rules**: Validación estricta en base de datos
- **API Rate Limiting**: Implementado en Cloudflare Workers
- **Env Vars**: Nunca commitear `.env` al repositorio
- **CORS**: Configurado para dominios específicos
- **Content Security Policy**: Headers configurados en Netlify

Ver [SECURITY_AUDIT.md](../SECURITY_AUDIT.md) para más información.

## 🚀 Deploy

### Netlify (Frontend)
```bash
# El deploy se hace automáticamente al hacer push a main
git push origin main

# Para preview de un branch
git push origin feature/nueva-funcionalidad
```

### Cloudflare Workers
```bash
# Deploy de workers
npx wrangler deploy

# Deploy específico
npx wrangler deploy workers/habitNotifications.ts
```

### Firebase Functions
```bash
# Deploy de todas las functions
firebase deploy --only functions

# Deploy de función específica
firebase deploy --only functions:onUserCreated
```

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## 🤝 Contribuir

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Realiza tus cambios siguiendo las convenciones:
   - Commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
   - Code style: Ejecuta `npm run format` antes de commitear
   - Tests: Asegúrate de que `npm run check` pase

3. Push y crea un Pull Request:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

4. Espera la revisión y merge

## 📝 Notas Importantes

- **NO** hacer public el repositorio sin revisar código y credenciales
- **NO** commitear archivos `.env`
- **NO** exponer claves de API en el código frontend
- Usar siempre variables de entorno para configuración sensible
- Mantener esta documentación actualizada

## 📞 Contacto Interno

Para dudas técnicas o problemas con el proyecto, contacta al equipo de desarrollo.

---

**Última actualización**: 2026-01-04
