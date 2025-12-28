import { z } from 'zod';
import type { SocialLink } from './artist';

// Social Link Schema
export const socialLinkSchema = z.object({
    platform: z.enum(['spotify', 'soundcloud', 'youtube', 'instagram', 'twitter', 'tiktok', 'website']),
    url: z.string().url({ message: "URL inválida" }),
    label: z.string().optional(),
});

// Artist Profile Schema
export const artistProfileSchema = z.object({
    artistName: z.string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
        .max(50, { message: "El nombre no puede exceder 50 caracteres" })
        .trim(),

    bio: z.string()
        .max(200, { message: "La bio no puede exceder 200 caracteres" })
        .trim()
        .default(""),

    avatarUrl: z.string()
        .url({ message: "URL de avatar inválida" })
        .optional()
        .or(z.literal("")),

    bannerUrl: z.string()
        .url({ message: "URL de banner inválida" })
        .optional()
        .or(z.literal("")),

    themeColor: z.string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Color inválido" })
        .optional(),

    accentColor: z.string()
        .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Color inválido" })
        .optional(),

    socialLinks: z.array(socialLinkSchema)
        .max(10, { message: "Máximo 10 enlaces de redes sociales" })
        .default([]),
});

// Inferred types
export type ArtistProfileFormData = z.infer<typeof artistProfileSchema>;
export type SocialLinkFormData = z.infer<typeof socialLinkSchema>;

// Helper function to validate and get errors
export function validateArtistProfile(data: unknown) {
    const result = artistProfileSchema.safeParse(data);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
        return { success: false, errors };
    }

    return { success: true, data: result.data };
}

export function validateSocialLink(data: unknown) {
    const result = socialLinkSchema.safeParse(data);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach((err) => {
            const path = err.path.join('.');
            errors[path] = err.message;
        });
        return { success: false, errors };
    }

    return { success: true, data: result.data };
}
