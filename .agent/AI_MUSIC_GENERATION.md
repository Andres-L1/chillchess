# Integración de Generación Musical con IA (Stable Audio)

## Estado: 📋 PROPUESTA TÉCNICA

---

## Objetivo
Implementar generación de música con IA en el panel `/admin` usando **Stable Audio Tools** de Stability AI para crear contenido musical original para el catálogo de ChillChess.

---

## Análisis de Viabilidad

### ✅ **ES POSIBLE** con las siguientes consideraciones:

#### **Arquitectura Recomendada:**
**Opción 1: API Externa (RECOMENDADO - Menor Complejidad)**
- **Servicio:** Replicate.com
- **Modelo:** `stable-audio-2.5` o `stable-audio-open-1.0`
- **Ventajas:**
  - ✅ Sin infraestructura GPU propia
  - ✅ Facturación por uso (pay-as-you-go)
  - ✅ Implementación rápida (días)
  - ✅ Mantenimiento mínimo
- **Desventajas:**
  - ⚠️ Costo por generación (~$0.01-0.10 USD/track)
  - ⚠️ Dependencia de servicio externo
  - ⚠️ Latencia adicional (API externa)

**Opción 2: Microservicio Python Propio**
- **Stack:** FastAPI + PyTorch + Stable Audio Tools
- **Infra:** Modal.com, RunPod, o servidor GPU dedicado
- **Ventajas:**
  - ✅ Control total sobre el modelo
  - ✅ Posibilidad de fine-tuning
  - ✅ Sin límites de rate-limiting externos
- **Desventajas:**
  - ⚠️ Requiere GPU potente (RTX 4090 / A100)
  - ⚠️ Costo fijo mensual (~$100-500 USD/mes)
  - ⚠️ Complejidad de deployment y mantenimiento
  - ⚠️ Tiempo de implementación (semanas)

**Opción 3: Stability AI API Oficial**
- **Servicio:** API directa de Stability AI
- **Ventajas:**
  - ✅ Modelo más reciente (Stable Audio 2.5)
  - ✅ Soporte oficial
  - ✅ Mayor calidad de output
- **Desventajas:**
  - ⚠️ Requiere cuenta enterprise (puede ser costoso)
  - ⚠️ Menos documentación pública

---

## Plan de Implementación (Opción 1 - Replicate)

### **Fase 1: Backend API (2-3 días)**
1. **Crear endpoint de generación:**
   - `POST /api/admin/generate-music`
   - Autenticación: Solo admins
   - Input: Prompt de texto + duración
   - Output: URL de audio generado en R2

2. **Integración con Replicate:**
```typescript
// src/routes/api/admin/generate-music/+server.ts
import Replicate from 'replicate';
import { r2, R2_BUCKET } from '$lib/server/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export const POST = async ({ request, locals }) => {
    // Auth check
    if (!locals.user?.isAdmin) {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, duration = 30 } = await request.json();

    const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
    });

    // Generate audio
    const output = await replicate.run(
        "stability-ai/stable-audio-open-1.0",
        {
            input: {
                prompt: prompt,
                seconds: duration,
                bpm: 120, // Configurable
            }
        }
    );

    // Download from Replicate
    const audioResponse = await fetch(output);
    const audioBuffer = await audioResponse.arrayBuffer();

    // Upload to R2
    const fileName = `generated/${Date.now()}_${crypto.randomUUID()}.mp3`;
    await r2.send(new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: fileName,
        Body: Buffer.from(audioBuffer),
        ContentType: 'audio/mpeg',
    }));

    const publicUrl = `https://pub-XXXXX.r2.dev/${fileName}`;

    return json({ 
        success: true, 
        audioUrl: publicUrl,
        prompt,
        duration 
    });
};
```

### **Fase 2: UI en Admin Panel (1-2 días)**
1. **Nueva pestaña "AI Studio" en `/admin`:**
   - Tab adicional junto a "Music", "Users", "Verify"
   - Formulario de generación:
     - Campo de texto para prompt
     - Slider de duración (10s - 90s)
     - Parámetros avanzados (BPM, estilo)
   - Preview del audio generado
   - Botón para añadir directamente al catálogo

2. **Ejemplo de interfaz:**
```svelte
<!-- src/lib/components/admin/AIStudioTab.svelte -->
<script lang="ts">
    let prompt = "Relaxing lo-fi hip hop beats, mellow piano, soft drums, chill vibes";
    let duration = 30;
    let isGenerating = false;
    let generatedUrl = "";

    async function generateMusic() {
        isGenerating = true;
        try {
            const res = await fetch('/api/admin/generate-music', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, duration })
            });
            const data = await res.json();
            generatedUrl = data.audioUrl;
        } catch (e) {
            alert('Error generating music: ' + e.message);
        } finally {
            isGenerating = false;
        }
    }
</script>

<div class="ai-studio">
    <h2>🎼 AI Music Studio</h2>
    
    <div class="prompt-section">
        <label>Descripción Musical:</label>
        <textarea 
            bind:value={prompt}
            placeholder="Describe el estilo, instrumentos, mood..."
            rows="4"
        ></textarea>
    </div>

    <div class="controls">
        <label>Duración: {duration}s</label>
        <input type="range" bind:value={duration} min="10" max="90" step="5" />
    </div>

    <button on:click={generateMusic} disabled={isGenerating}>
        {isGenerating ? '⏳ Generando...' : '🎵 Generar Música'}
    </button>

    {#if generatedUrl}
        <div class="preview">
            <audio controls src={generatedUrl}></audio>
            <button on:click={addToCatalog}>➕ Añadir al Catálogo</button>
        </div>
    {/if}
</div>
```

### **Fase 3: Gestión y Metadata (1 día)**
1. **Sistema de etiquetado automático:**
   - Guardar prompt original como metadata
   - Generar título y artista basado en el prompt
   - Asignar a categoría automáticamente (lo-fi/jazz/ambient)

2. **Historial de generaciones:**
   - Tabla con todas las pistas generadas
   - Poder re-generar variaciones
   - Sistema de favoritos para buenas generaciones

---

## Costos Estimados

### **Opción 1 (Replicate):**
- **Setup:** $0 (solo desarrollo)
- **Uso:** ~$0.05 USD por track de 30s
- **Estimación mensual:** $5-20 USD (100-400 generaciones/mes)

### **Opción 2 (Microservicio Propio):**
- **Setup:** $200-500 (desarrollo + GPU)
- **Uso:** $150-400 USD/mes (servidor GPU + almacenamiento)
- **ROI:** >100 generaciones/mes para ser rentable

---

## Requisitos Técnicos

### **Dependencias NPM:**
```bash
npm install replicate @aws-sdk/client-s3
```

### **Variables de Entorno (.env):**
```bash
REPLICATE_API_TOKEN=r8_xxxxx...
R2_BUCKET_NAME=chillchess-music
PUBLIC_R2_ACCOUNT_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
```

---

## Timeline Propuesto

| Fase | Tarea | Tiempo | Responsable |
|------|-------|--------|-------------|
| 1 | Setup de cuenta Replicate | 1h | Admin |
| 2 | Crear endpoint API backend | 4-6h | Dev |
| 3 | UI del AI Studio Tab | 4-6h | Dev |
| 4 | Integración con catálogo | 2-3h | Dev |
| 5 | Testing y ajustes | 2-3h | QA/Admin |
| **TOTAL** | | **2-3 días** | |

---

## Próximos Pasos

1. ✅ **Decisión:** ¿Proceder con Opción 1 (Replicate)?
2. 📝 **Crear cuenta en Replicate.com** y obtener API key
3. 💳 **Añadir método de pago** (créditos iniciales gratis)
4. 🔧 **Desarrollo:** Implementar según plan
5. 🧪 **Testing:** Generar primeras pistas de prueba
6. 🚀 **Deploy:** Lanzar feature en producción

---

## Notas Adicionales

### **Calidad Esperada:**
- ✅ Audio estéreo a 44.1 kHz
- ✅ Música coherente y estructurada
- ⚠️ Puede requerir varios intentos para resultados óptimos
- ⚠️ No reemplaza músicos profesionales (complemento)

### **Casos de Uso:**
1. **Prototipos rápidos:** Generar demos antes de contratar músicos
2. **Filler content:** Música de relleno para expandir catálogo
3. **Experimentación:** Probar estilos nuevos sin costo
4. **Personalización:** Música generada para momentos específicos (torneo, evento)

### **Limitaciones:**
- No puede generar voces/letras realistas
- Mejor para música instrumental (lo-fi, ambient, jazz)
- Tracks cortos (< 3 min con Stable Audio 2.5)
- Necesita prompts descriptivos y específicos

---

## Ejemplo de Prompts Efectivos

```text
✅ BUENOS PROMPTS:
- "Relaxing lo-fi hip hop with vinyl crackle, mellow Rhodes piano, soft kick drum, smooth bass, 85 BPM"
- "Ambient electronic soundscape with warm pads, gentle rainfall, distant piano, meditative, slow tempo"
- "Smooth jazz with upright bass, soft brushed drums, warm saxophone melody, late night cafe vibe"

❌ MALOS PROMPTS:
- "Music" (Demasiado vago)
- "Happy song" (Falta detalle instrumental)
- "Lo-fi" (Necesita más contexto)
```

---

**Documento creado:** 2025-12-31  
**Autor:** Antigravity AI  
**Versión:** 1.0  
**Estado:** Awaiting Approval
