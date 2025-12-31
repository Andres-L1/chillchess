# ChillChess ♟️
> **El Santuario Visual del Ajedrecista**

ChillChess no es para competir, es para estar. Un espacio digital diseñado para el "Deep Work", donde tableros estéticos reproducen partidas inmortales en bucle, acompañados de atmósferas sonoras Lo-Fi.

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

## 🗺️ Roadmap

- [x] **Fase 1: El Esqueleto** (Setup, UI Base, Board Visualization)
- [x] **Fase 2: El Cerebro** (Lógica de reproducción, PGNs, Controles)
- [x] **Fase 3: La Atmósfera** (Audio Player, Fondos Dinámicos)
- [x] **Fase 4: Comunidad** (Propuestas, Bug Reports, Admin Panel)
- [ ] **Fase 5: Torneos** (Sistema de competición)

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestra [Guía de Contribución](.agent/CONTRIBUTING.md) antes de enviar un PR.

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some amazing feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT. Hecho con 💙 para los amantes del ajedrez y el código.

