# 🚀 Guía de Despliegue en Netlify

## Paso 1: Conectar el Repositorio

1. Ve a https://app.netlify.com/
2. Busca el sitio con ID: `f7e00e1b-6f5b-4943-85e9-2a1dbb8e8e45`
3. Ve a **Site configuration** → **Build & deploy** → **Link repository**
4. Selecciona GitHub y autoriza el acceso
5. Elige el repositorio: `Andres-L1/chillchess`

## Paso 2: Configurar Build Settings

En **Build settings**, asegúrate que estén así:

```
Build command: npm run build
Publish directory: build
```

✅ Ya está configurado en `netlify.toml`

## Paso 3: Variables de Entorno

### Obtener MapTiler API Key (OBLIGATORIO)

1. Ve a https://www.maptiler.com/cloud/
2. Crea una cuenta gratuita
3. Haz clic en **"Get API Key"** o crea un nuevo proyecto
4. Copia tu API key

### Añadir en Netlify

1. En tu sitio de Netlify, ve a **Site configuration** → **Environment variables**
2. Haz clic en **"Add a variable"**
3. Añade:
   - **Key**: `PUBLIC_MAPTILER_API_KEY`
   - **Value**: [tu API key de MapTiler]
4. Guarda los cambios

## Paso 4: Configurar Dominio (Opcional)

Si quieres usar `chillchess.app`:

1. Ve a **Domain management**
2. Haz clic en **"Add custom domain"**
3. Escribe: `chillchess.app`
4. Sigue las instrucciones para configurar el DNS

Por ahora puedes usar el dominio temporal de Netlify (algo como `sitio-random.netlify.app`)

## Paso 5: Desplegar

1. Una vez configuradas las variables de entorno, haz clic en **"Deploy site"**
2. O simplemente haz un nuevo commit y push:
   ```bash
   git add .
   git commit -m "Update config"
   git push
   ```

Netlify detectará el cambio y desplegará automáticamente.

## Verificar el Despliegue

Una vez desplegado:

1. Visita tu URL de Netlify
2. Deberías ver el mapa oscuro de ChillChess
3. Acepta los permisos de geolocalización
4. Verás un marcador pulsante en tu ubicación

## 📱 Probar como PWA

En tu móvil:

1. Abre la URL en Chrome/Safari
2. Busca el botón "Añadir a pantalla de inicio"
3. Instala ChillChess
4. ¡Ábrela como una app nativa!

## Troubleshooting

### El mapa no carga
- ✅ Verifica que añadiste `PUBLIC_MAPTILER_API_KEY` en Netlify
- ✅ Revisa el build log en Netlify para errores

### No me pide permisos de ubicación
- ✅ Asegúrate de estar en HTTPS (Netlify lo hace automáticamente)
- ✅ Dale permisos de ubicación en la configuración del navegador

### El build falla
- ✅ Verifica que `netlify.toml` existe en el repositorio
- ✅ Revisa los logs de build en Netlify dashboard

---

## Siguiente Paso: Desarrollo Local

Para trabajar localmente, crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
PUBLIC_MAPTILER_API_KEY=tu_api_key_aqui
```

Luego ejecuta:
```bash
npm run dev
```

Visita http://localhost:5173
