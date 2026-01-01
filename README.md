# ChillChess ♟️
> **Música • Ambiente • Vibes**

Encuentra tu calma. Encuentra tu estilo.
Música de todo tipo sin interrupciones, perfecta para tus **Streams** y sesiones de **Deep Work**. Olvídate del Copyright y los anuncios.

🔗 **[chillchess.app](https://chillchess.app)**

## 🌟 Concepto

ChillChess es tu segunda pantalla perfecta. Entra, elige tu ambiente y disfruta de una experiencia musical inmersiva diseñada para creadores de contenido y productividad.

*   **Música Lo-Fi & Chill**: Selección curada para concentración y relax.
*   **Widget OBS**: Integra la música en tus streams con widgets personalizables y elegantes.
*   **Atmósferas**: Mezcla sonidos de White Noise (lluvia, cafetería, bosque, etc.) con tu música.
*   **Salas Compartidas**: Escucha música sincronizada con tus amigos o comunidad en tiempo real.
*   **Zero Distractions**: Interfaz minimalista "Glassmorphism" con tema Gold & Noir.

## 🛠️ Tech Stack

Arquitectura "Zero Cost & High Speed".

*   **Frontend**: SvelteKit (Rendering & State)
*   **UI/UX**: TailwindCSS + Glassmorphism Design
*   **Backend**: Firebase (Auth, Firestore, Functions)
*   **Storage**: Cloudflare R2 (Audio Hosting)
*   **Deployment**: Netlify (CI/CD)

## 📚 Documentación

- **[Arquitectura del Proyecto](.agent/ARCHITECTURE.md)** - Estructura, convenciones y mejores prácticas
- **[Guía de Contribución](.agent/CONTRIBUTING.md)** - Cómo contribuir al proyecto
- **[Tareas Pendientes](.agent/PENDING_FIXES.md)** - Bugs conocidos y features por implementar
- **[Estado de Features](FEATURES_STATUS.md)** - Resumen de funcionalidades implementadas

## 🚀 Development

### Requisitos
*   Node.js 18+
*   npm 9+
*   Cuenta de Firebase

### Instalación

```bash
git clone https://github.com/Andres-L1/chillchess.git
cd chillchess
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de Firebase
```

### Ejecutar Localmente

```bash
# Modo desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── lib/
│   ├── components/      # Componentes Svelte reutilizables
│   ├── types/           # Tipos TypeScript compartidos
│   ├── utils/           # Logger, validators, formatters
│   ├── constants/       # Constantes de la app
│   ├── auth/            # Autenticación
│   └── audio/           # Sistema de reproducción
├── routes/              # Páginas SvelteKit
└── app.d.ts            # Tipos globales
```

Ver [ARCHITECTURE.md](.agent/ARCHITECTURE.md) para detalles completos.

## 🗺️ Roadmap

El objetivo es crear la plataforma definitiva de música para concentración y streaming.

- [x] **Core Player**: Reproducción continua, control de volumen, metadata.
- [x] **Atmósferas**: Sistema de mezcla de White Noise.
- [x] **OBS Widget**: Overlay para streamers.
- [x] **Social**: Salas de escucha compartida.
- [ ] **Apps Nativas**: Desktop y Mobile.
- [ ] **Modo TV**: Interfaz optimizada para pantallas grandes.

## 📝 Changelog

Ver [CHANGELOG.md](CHANGELOG.md) para el historial completo de versiones.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](.agent/CONTRIBUTING.md) antes de enviar un PR.

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some amazing feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT. Hecho con 💙 para los creadores y amantes de la música.
© 2025 ChillChess Team.
