# ChillChess ♟️
> **Música • Ambiente • Vibes**

Encuentra tu calma. Encuentra tu estilo.
Música de todo tipo sin interrupciones, perfecta para tus **Streams** y sesiones de **Deep Work**. Olvídate del Copyright y los anuncios.

🔗 **[chillchess.app](https://chillchess.app)**

## 🌟 Concepto

A diferencia de otras plataformas centradas en el estrés, el ELO y el reloj, ChillChess busca ser tu segunda pantalla perfecta. Entra, elige tu ambiente, y deja que la belleza del ajedrez fluya.

*   **Visualizador Pasivo**: Tableros que reproducen partidas históricas automáticamente.
*   **Atmósferas**: Sonidos de lluvia, cafetería o biblioteca combinados con música Lo-Fi.
*   **Zero Distractions**: Interfaz minimalista "Glassmorphism" con tema Gold & Noir.

## 🛠️ Tech Stack

Arquitectura "Zero Cost & High Speed".

*   **Frontend**: SvelteKit (Rendering & State)
*   **UI/UX**: TailwindCSS + Glassmorphism Design
*   **Chess Logic**: `chess.js` (Rules) + `cm-chessboard` (Visualization)
*   **Backend**: Firebase (Auth, Firestore, Functions)
*   **Storage**: Cloudflare R2
*   **Deployment**: Netlify (CI/CD)

## 📚 Documentación

- **[Arquitectura del Proyecto](.agent/ARCHITECTURE.md)** - Estructura, convenciones y mejores prácticas
- **[Guía de Contribución](.agent/CONTRIBUTING.md)** - Cómo contribuir al proyecto
- **[Tareas Pendientes](.agent/PENDING_FIXES.md)** - Bugs conocidos y features por implementar

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

## 🗺️ Roadmap hacia v1.0

El objetivo principal para la versión 1.0 es alcanzar la **estabilidad total** y el perfeccionamiento de todas las funcionalidades existentes, junto con la incorporación de sistemas clave de competición.

- [x] **Fase 1: El Santuario** (Visualización, Audio, Atmósfera)
- [x] **Fase 2: La Comunidad** (Propuestas, Usuarios, Bug Reports)
- [x] **Fase 3: La Fundación** (Admin Panel 2.0, Infraestructura de Código, Tooling)
- [ ] **Fase 4: La Expansión** (Apps Nativas, Modo TV, Integración IoT)
- [ ] **Fase 5: v1.0 Release Candidate** (Auditoría de Seguridad, Performance Tuning, SEO)

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

MIT. Hecho con 💙 para los amantes del ajedrez y el código.
© 2025 ChillChess Team.

