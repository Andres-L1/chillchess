# Validación con Zod y Modals - Guía de Uso

## 📦 Instalación

Primero, instala Zod en el proyecto:

```bash
npm install zod
```

## 🎯 Componentes Creados

### 1. **Esquemas de Validación** (`src/lib/validation/artist.ts`)

#### Uso Básico:
```typescript
import { validateArtistProfile, validateSocialLink } from '$lib/validation/artist';

// Validar perfil completo
const result = validateArtistProfile({
    artistName: "DJ LoFi",
    bio: "Música para estudiar",
    avatarUrl: "https://example.com/avatar.jpg",
    socialLinks: []
});

if (!result.success) {
    console.log(result.errors);
    // { artistName: "El nombre debe tener al menos 2 caracteres" }
}
```

#### Validaciones Incluidas:
- **artistName:** 2-50 caracteres, requerido
- **bio:** Máximo 200 caracteres
- **avatarUrl:** URL válida o vacío
- **bannerUrl:** URL válida o vacío
- **themeColor/accentColor:** Formato hexadecimal válido (#RGB o #RRGGBB)
- **socialLinks:** Máximo 10 enlaces, cada uno con URL válida

---

### 2. **Modal Component** (`src/lib/components/Modal.svelte`)

#### Props:
```typescript
show: boolean = false
title: string = ""
type: "info" | "success" | "error" | "warning" | "confirm" = "info"
showCancel: boolean = false
confirmText: string = "Aceptar"
cancelText: string = "Cancelar"
size: "sm" | "md" | "lg" = "md"
```

#### Uso:
```svelte
<script>
    import Modal from '$lib/components/Modal.svelte';
    
    let showSuccess = false;
    let showConfirm = false;
</script>

<!-- Success Modal -->
<Modal
    show={showSuccess}
    title="¡Perfil Guardado!"
    type="success"
    on:close={() => showSuccess = false}
>
    <p>Tu perfil se ha guardado correctamente.</p>
</Modal>

<!-- Confirmation Modal -->
<Modal
    show={showConfirm}
    title="¿Eliminar perfil?"
    type="warning"
    showCancel={true}
    confirmText="Eliminar"
    cancelText="Cancelar"
    on:confirm={handleDelete}
    on:cancel={() => showConfirm = false}
    on:close={() => showConfirm = false}
>
    <p>Esta acción no se puede deshacer.</p>
</Modal>
```

#### Tipos de Modal:
- **info** 📘 - Información general (azul)
- **success** ✅ - Acción exitosa (verde)
- **error** ❌ - Error (rojo)
- **warning** ⚠️ - Advertencia (amarillo)
- **confirm** ❓ - Confirmación (morado)

---

### 3. **FormInput Component** (`src/lib/components/FormInput.svelte`)

#### Props:
```typescript
id: string
label: string
type: string = "text"
value: string = ""
placeholder: string = ""
error: string = ""
required: boolean = false
maxlength: number | undefined
disabled: boolean = false
helperText: string = ""
```

#### Uso:
```svelte
<script>
    import FormInput from '$lib/components/FormInput.svelte';
    
    let artistName = "";
    let errors = {};
</script>

<FormInput
    id="artist-name"
    label="Nombre de Artista"
    bind:value={artistName}
    placeholder="Tu nombre artístico"
    required={true}
    maxlength={50}
    error={errors.artistName}
    helperText="2-50 caracteres"
/>
```

---

### 4. **FormTextarea Component** (`src/lib/components/FormTextarea.svelte`)

#### Props:
```typescript
id: string
label: string
value: string = ""
placeholder: string = ""
error: string = ""
required: boolean = false
maxlength: number | undefined
rows: number = 3
disabled: boolean = false
showCounter: boolean = true
```

#### Uso:
```svelte
<script>
    import FormTextarea from '$lib/components/FormTextarea.svelte';
    
    let bio = "";
    let errors = {};
</script>

<FormTextarea
    id="bio"
    label="Biografía"
    bind:value={bio}
    placeholder="Cuéntanos sobre tu música..."
    maxlength={200}
    rows={4}
    error={errors.bio}
    showCounter={true}
/>
```

---

## 🔄 Ejemplo Completo: Formulario con Validación

```svelte
<script lang="ts">
    import { validateArtistProfile } from '$lib/validation/artist';
    import Modal from '$lib/components/Modal.svelte';
    import FormInput from '$lib/components/FormInput.svelte';
    import FormTextarea from '$lib/components/FormTextarea.svelte';
    
    // Form state
    let artistName = "";
    let bio = "";
    let avatarUrl = "";
    
    // Error state
    let errors: Record<string, string> = {};
    
    // Modal state
    let showSuccessModal = false;
    let showErrorModal = false;
    let errorMessage = "";
    
    function handleSubmit() {
        // Validate
        const result = validateArtistProfile({
            artistName,
            bio,
            avatarUrl: avatarUrl || undefined,
            socialLinks: []
        });
        
        if (!result.success) {
            errors = result.errors;
            errorMessage = "Por favor corrige los errores en el formulario";
            showErrorModal = true;
            return;
        }
        
        // Clear errors
        errors = {};
        
        // Save to Firestore...
        saveProfile(result.data)
            .then(() => {
                showSuccessModal = true;
            })
            .catch((err) => {
                errorMessage = err.message;
                showErrorModal = true;
            });
    }
    
    async function saveProfile(data: any) {
        // Your save logic here
    }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
    <FormInput
        id="artist-name"
        label="Nombre de Artista"
        bind:value={artistName}
        placeholder="Tu nombre artístico"
        required={true}
        maxlength={50}
        error={errors.artistName}
    />
    
    <FormTextarea
        id="bio"
        label="Biografía"
        bind:value={bio}
        placeholder="Cuéntanos sobre tu música..."
        maxlength={200}
        error={errors.bio}
    />
    
    <FormInput
        id="avatar"
        label="Avatar URL"
        type="url"
        bind:value={avatarUrl}
        placeholder="https://example.com/avatar.jpg"
        error={errors.avatarUrl}
    />
    
    <button
        type="submit"
        class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold"
    >
        Guardar Perfil
    </button>
</form>

<!-- Success Modal -->
<Modal
    show={showSuccessModal}
    title="¡Perfil Guardado!"
    type="success"
    on:close={() => showSuccessModal = false}
>
    <p>Tu perfil se ha guardado correctamente.</p>
</Modal>

<!-- Error Modal -->
<Modal
    show={showErrorModal}
    title="Error"
    type="error"
    on:close={() => showErrorModal = false}
>
    <p>{errorMessage}</p>
</Modal>
```

---

## 🎨 Características de los Componentes

### **FormInput / FormTextarea:**
- ✅ Validación visual automática (rojo cuando hay error)
- ✅ Iconos de estado
- ✅ Helper text
- ✅ Contador de caracteres (textarea)
- ✅ Estados disabled/required
- ✅ Animaciones suaves
- ✅ Focus states con ring

### **Modal:**
- ✅ Backdrop con blur
- ✅ 5 tipos con colores diferentes
- ✅ Animaciones de entrada/salida
- ✅ 3 tamaños (sm, md, lg)
- ✅ Botones personalizables
- ✅ Click fuera para cerrar
- ✅ Eventos: confirm, cancel, close

---

## 📝 Mensajes de Error Personalizados

Los esquemas de Zod ya incluyen mensajes en español:

```typescript
{
    "artistName.too_small": "El nombre debe tener al menos 2 caracteres",
    "artistName.too_big": "El nombre no puede exceder 50 caracteres",
    "bio.too_big": "La bio no puede exceder 200 caracteres",
    "avatarUrl.invalid_string": "URL de avatar inválida",
    "socialLinks.too_big": "Máximo 10 enlaces de redes sociales"
}
```

---

## 🚀 Próximos Pasos

1. **Instalar Zod:** `npm install zod`
2. **Integrar en formularios existentes**
3. **Reemplazar `alert()` por Modals**
4. **Agregar validación en tiempo real** (on:blur)
5. **Toast notifications** para feedback rápido

---

## 💡 Tips

1. **Validar en blur:** Para mejor UX, valida cuando el usuario sale del campo
2. **Limpiar errores:** Limpia el error del campo cuando el usuario empieza a escribir
3. **Mensajes específicos:** Los mensajes de error son específicos y en español
4. **Accesibilidad:** Todos los componentes tienen labels asociados correctamente
5. **Modals vs Toasts:** Usa modals para acciones importantes, toasts para feedback rápido
