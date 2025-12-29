# Guía para Añadir Sonidos Ambientales

## 🎧 Cómo agregar los archivos de sonido

El sistema de White Noise está completamente funcional, solo necesita los archivos MP3.

### 📁 Ubicación
Todos los archivos deben ir en: `static/sounds/`

### 📝 Archivos necesarios (exactamente con estos nombres):
1. `rain.mp3` - Sonido de lluvia suave
2. `fire.mp3` - Crepitar de chimenea/fuego
3. `cafe.mp3` - Ambiente de cafetería
4. `ocean.mp3` - Olas del mar
5. `forest.mp3` - Sonidos de bosque/pájaros

### 🔊 Recomendaciones:
- **Duración**: 3-10 minutos (se reproducen en loop)
- **Formato**: MP3, 128kbps es suficiente
- **Volumen**: Normalizado, no muy fuerte

### 🌐 Fuentes Gratuitas Recomendadas:

#### Opción 1: Pixabay (Recomendada - Sin registro)
1. Ve a https://pixabay.com/sound-effects/
2. Busca cada sonido (rain, fire, cafe ambience, ocean waves, forest birds)
3. Descarga los que te gusten
4. Renombra según los nombres de arriba
5. Coloca en `static/sounds/`

#### Opción 2: Freesound.org (Requiere registro gratuito)
1. Crea cuenta en https://freesound.org
2. Busca y descarga cada sonido
3. Renombra y coloca en `static/sounds/`

#### Opción 3: YouTube Audio Library
1. Ve a https://studio.youtube.com (requiere cuenta de Google)
2. Audio Library → Sound Effects
3. Busca "rain", "fireplace", "cafe", "ocean", "forest"
4. Descarga, renombra y coloca en `static/sounds/`

#### Opción 4: Mixkit (Sin registro)
1. Ve a https://mixkit.co/free-sound-effects/ambient/
2. Busca cada tipo de sonido
3. Descarga directamente en MP3
4. Renombra y coloca en `static/sounds/`

### ✅ Como probar:
1. Añade los 5 archivos MP3 a `/static/sounds/`
2. Inicia la app: `npm run dev`
3. Ve a `/app`
4. Click en el botón "🎧 White Noise"
5. Selecciona un sonido y ajusta el volumen

### 🎯 Alternativa Rápida:
Si quieres algo temporal para probar, busca "rain sound 10 minutes" en YouTube y descarga el audio con cualquier convertidor online (como y2mate.com), luego renombra a `rain.mp3`.

### 📌 Nota Importante:
Los sonidos deben ser **loops perfectos** (sin cortes audibles al repetir) para mejor experiencia.

---

Una vez agregados los archivos, el White Noise estará 100% funcional! 🎉
