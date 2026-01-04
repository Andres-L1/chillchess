import type { Habit, HabitEvent, DayType } from '$lib/types/habit';
import { DayType as DayTypeEnum } from '$lib/types/habit';

/**
 * Calcula la racha actual de un hábito basándose en su historial de eventos
 * Implementación basada en el algoritmo de Habo (statistics.dart)
 */
export function calculateCurrentStreak(habit: Habit): number {
    const events = habit.events || {};
    const sortedDates = Object.keys(events).sort();

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    let tempStreak = 0;
    let failBuffer = false; // Para la Two-Day Rule

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Recorremos desde hoy hacia atrás
    let currentDate = new Date(today);
    let consecutiveDays = 0;

    // Buscar el último día con actividad
    const lastEventDate = new Date(sortedDates[sortedDates.length - 1]);

    // Si el último evento es de hace más de 2 días, la racha es 0
    const daysDiff = Math.floor((today.getTime() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > (habit.twoDayRule ? 2 : 1)) {
        return 0;
    }

    // Recorrer desde hoy hacia atrás
    for (let i = 0; i < 365; i++) { // Máximo 1 año atrás
        const dateStr = currentDate.toISOString().split('T')[0];
        const event = events[dateStr];

        if (!event) {
            // Día sin evento
            if (habit.twoDayRule && failBuffer) {
                // Ya teníamos un fallo previo, la racha se rompe
                break;
            } else if (habit.twoDayRule && i > 0) {
                // Primer día sin evento con Two-Day Rule, sigue contando
                failBuffer = true;
            } else if (i > 0) {
                // Sin Two-Day Rule, rompemos la racha
                break;
            }
        } else {
            const eventType = event.type;

            if (eventType === DayTypeEnum.CHECK) {
                streak++;
                failBuffer = false;
            } else if (eventType === DayTypeEnum.PROGRESS && habit.targetValue) {
                // Para hábitos numéricos, ver si alcanzó la meta
                if (event.value && event.value >= habit.targetValue) {
                    streak++;
                    failBuffer = false;
                } else {
                    // No alcanzó la meta
                    if (habit.twoDayRule && failBuffer) {
                        break;
                    } else if (habit.twoDayRule) {
                        failBuffer = true;
                    } else {
                        break;
                    }
                }
            } else if (eventType === DayTypeEnum.FAIL) {
                if (habit.twoDayRule && !failBuffer) {
                    failBuffer = true;
                } else {
                    break;
                }
            } else if (eventType === DayTypeEnum.SKIP) {
                // Skip no rompe ni suma a la racha
                failBuffer = false;
            } else {
                // Clear o cualquier otro: rompe la racha
                if (i > 0) break;
            }
        }

        currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
}

/**
 * Calcula la racha máxima histórica
 */
export function calculateTopStreak(habit: Habit): number {
    const events = habit.events || {};
    const sortedDates = Object.keys(events).sort();

    if (sortedDates.length === 0) return 0;

    let topStreak = 0;
    let currentStreak = 0;
    let failBuffer = false;

    for (const dateStr of sortedDates) {
        const event = events[dateStr];
        const eventType = event.type;

        if (eventType === DayTypeEnum.CHECK) {
            currentStreak++;
            failBuffer = false;
            topStreak = Math.max(topStreak, currentStreak);
        } else if (eventType === DayTypeEnum.PROGRESS && habit.targetValue) {
            if (event.value && event.value >= habit.targetValue) {
                currentStreak++;
                failBuffer = false;
                topStreak = Math.max(topStreak, currentStreak);
            } else {
                if (habit.twoDayRule && !failBuffer) {
                    failBuffer = true;
                } else {
                    currentStreak = 0;
                    failBuffer = false;
                }
            }
        } else if (eventType === DayTypeEnum.FAIL) {
            if (habit.twoDayRule && !failBuffer) {
                failBuffer = true;
            } else {
                currentStreak = 0;
                failBuffer = false;
            }
        } else if (eventType === DayTypeEnum.SKIP) {
            failBuffer = false;
        } else {
            // Clear: reset if it appears in the historical data
            currentStreak = 0;
            failBuffer = false;
        }
    }

    return topStreak;
}

/**
 * Obtiene el estado de un día específico
 */
export function getDayStatus(habit: Habit, dateStr: string): DayType {
    const event = habit.events?.[dateStr];
    return event?.type || DayTypeEnum.CLEAR;
}

/**
 * Obtiene estadísticas generales del hábito
 */
export function getHabitStatistics(habit: Habit) {
    const events = habit.events || {};
    let totalChecks = 0;
    let totalFails = 0;
    let totalSkips = 0;
    let totalProgress = 0;

    for (const event of Object.values(events)) {
        switch (event.type) {
            case DayTypeEnum.CHECK:
                totalChecks++;
                break;
            case DayTypeEnum.FAIL:
                totalFails++;
                break;
            case DayTypeEnum.SKIP:
                totalSkips++;
                break;
            case DayTypeEnum.PROGRESS:
                totalProgress += event.value || 0;
                break;
        }
    }

    const total = totalChecks + totalFails;
    const completionRate = total > 0 ? (totalChecks / total) * 100 : 0;

    return {
        totalChecks,
        totalFails,
        totalSkips,
        totalProgress,
        completionRate,
        currentStreak: calculateCurrentStreak(habit),
        topStreak: calculateTopStreak(habit)
    };
}
