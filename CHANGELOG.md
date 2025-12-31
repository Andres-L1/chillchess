# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-12-31 "The Foundation Update"

Esta actualización marca un antes y un después en la arquitectura del proyecto, estableciendo las bases sólidas necesarias para escalar hacia la versión 1.0. Se ha priorizado la calidad del código, la estabilidad de las herramientas de administración y la experiencia de desarrollo.

### 🚀 Added
- **Centralized Logging System:** Nuevo logger robusto (`debug`, `info`, `warn`, `error`) con soporte para contexto y niveles, preparado para integración con Sentry.
- **Shared Types Library:** Centralización de todas las interfaces TypeScript (`User`, `Proposal`, `BugReport`, etc.) en `src/lib/types` para eliminar duplicidad.
- **Utility Belt:** Nuevas librerías de utilidades:
  - `validators.ts`: Validación reutilizable para emails, URLs, archivos, etc.
  - `formatters.ts`: Formateo consistente de fechas, números, duraciones y cadenas.
  - `constants/index.ts`: Centralización de strings mágicos, límites y configuraciones.
- **Testing Infrastructure:** Implementación completa de **Vitest** + **Testing Library**.
- **Dev Tooling:** Configuración de **Husky** (hooks de git), **lint-staged**, **Commitlint** y **Prettier** para asegurar calidad de código automática.
- **Performance Monitoring:** Sistema de tracking de **Web Vitals** (LCP, FID, CLS).
- **Admin Mobile Drawer:** Nuevo menú lateral responsivo para el panel de administración, optimizado para móviles.

### ♻️ Changed
- **Admin Panel UI Refresh:** Rediseño completo de `src/routes/admin` adoptando estética **Glassmorphism** real (backdrop-blur, bordes traslúcidos) y mejorando la consistencia visual.
- **Admin Stats Engine:** Refactorización de la carga de estadísticas usando `countFromServer` de Firestore para optimizar lecturas y rendimiento masivo.
- **Codebase Refactor:** Actualización de múltiples componentes (`UsersTab`, `Bugs page`) para usar las nuevas utilidades y tipos compartidos.
- **Netlify Deploy Fix:** Script `prepare` actualizado para ser tolerante a entornos de producción sin devDependencies.

### 🐛 Fixed
- **Admin Scroll Issues:** Eliminado el desplazamiento horizontal no deseado en dispositivos móviles.
- **Accessibility (a11y):** Añadido soporte de teclado y roles ARIA a elementos interactivos clave en el panel de administración.
- **Dropdowns Legacy:** Reemplazados selects nativos por menús flotantes personalizados en la página de Bugs.
- **Vitest Config:** Resueltos conflictos de dependencias y configuración de mocks (`IntersectionObserver`) para los tests unitarios.

### 📚 Documentation
- **Architecture Guide:** Nueva guía exhaustiva `ARCHITECTURE.md` detallando la estructura y decisiones técnicas.
- **Contribution Guide:** Nueva guía `CONTRIBUTING.md` para estandarizar el flujo de trabajo de nuevos desarrolladores.

---

## [0.4.0] - 2025-12-25 "The Community Update"
- Sistema completo de reporte de bugs (/bugs).
- Sistema de votación de propuestas.
- Integración inicial de Firebase Auth y Firestore Security Rules.
