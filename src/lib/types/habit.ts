// Tipos de evento para un día (basado en Habo's DayType)
export enum DayType {
    CLEAR = 'clear',      // Sin marcar
    CHECK = 'check',      // Completado
    FAIL = 'fail',        // Fallado
    SKIP = 'skip',        // Saltado (no rompe racha)
    PROGRESS = 'progress' // Progreso en hábito numérico
}

// Tipos de hábito (basado en Habo's HabitType)
export enum HabitType {
    BOOLEAN = 'boolean',  // Sí/No (completado o no)
    NUMERIC = 'numeric'   // Meta numérica (ej: 8 vasos de agua)
}

// Estructura de un evento en el historial
export interface HabitEvent {
    date: string;         // YYYY-MM-DD
    type: DayType;        // Tipo de evento
    value?: number;       // Para hábitos numéricos
    comment?: string;     // Comentario opcional
}

// Modelo completo de hábito (basado en HabitData de Habo)
export interface Habit {
    id: string;
    userId: string;

    // Contenido básico
    title: string;
    cue?: string;         // Señal (qué desencadena el hábito)
    routine?: string;     // Rutina (qué hacer)
    reward?: string;      // Recompensa (por qué hacerlo)

    // Configuración
    habitType: HabitType;
    twoDayRule: boolean;  // Permite 1 fallo sin romper racha
    archived: boolean;
    advanced: boolean;    // Mostrar campos avanzados

    // Hábitos numéricos
    targetValue?: number; // Meta (ej: 8 vasos)
    partialValue?: number;// Incremento por defecto
    unit?: string;        // Unidad (ej: "vasos", "km")

    // Recordatorios
    notification: boolean;
    notTime?: string;     // HH:mm

    // Consecuencias (opcional, Habo feature)
    sanction?: string;    // Castigo si fallas
    showSanction: boolean;
    accountant?: string;  // Quien supervisa

    // Historial de eventos
    events: Record<string, HabitEvent>; // { "2024-01-03": { type: "check", ... } }

    // Estadísticas calculadas
    currentStreak: number;
    topStreak: number;

    // Metadata
    position: number;     // Para ordenar
    createdAt: any;
    timeOfDay?: string;   // Mañana/Tarde/Noche (para filtros)
    frequency?: string;   // A diario/L-V/Finde
    color?: string;       // Color visual
}
