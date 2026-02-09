/**
 * Profile Storage Service
 * 
 * Handles user profile image uploads/downloads using Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '$lib/firebase';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB (matches storage.rules)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Validates image file before upload
 */
function validateImageFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Formato no soportado. Usa JPG, PNG, WebP o GIF'
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `El archivo no puede exceder ${MAX_FILE_SIZE / 1024 / 1024}MB`
        };
    }

    return { valid: true };
}

/**
 * Upload user profile image to Firebase Storage
 * @param userId - User ID
 * @param file - Image file to upload
 * @returns Download URL of uploaded image
 */
export async function uploadProfileImage(userId: string, file: File): Promise<string> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Create storage reference
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `profiles/${userId}/avatar.${fileExtension}`);

    // Upload file
    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            uploadedAt: new Date().toISOString()
        }
    });

    // Get and return download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}

/**
 * Get profile image URL for a user
 * @param userId - User ID
 * @returns Download URL or null if no image exists
 */
export async function getProfileImageUrl(userId: string): Promise<string | null> {
    try {
        // Try common extensions
        const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

        for (const ext of extensions) {
            try {
                const storageRef = ref(storage, `profiles/${userId}/avatar.${ext}`);
                const url = await getDownloadURL(storageRef);
                return url;
            } catch (e) {
                // File doesn't exist with this extension, try next
                continue;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting profile image:', error);
        return null;
    }
}

/**
 * Delete user profile image
 * @param userId - User ID
 */
export async function deleteProfileImage(userId: string): Promise<void> {
    const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

    for (const ext of extensions) {
        try {
            const storageRef = ref(storage, `profiles/${userId}/avatar.${ext}`);
            await deleteObject(storageRef);
            return; // Successfully deleted
        } catch (e) {
            // File doesn't exist with this extension, try next
            continue;
        }
    }
}

/**
 * Upload artist banner image to Firebase Storage
 * @param userId - User ID
 * @param file - Image file to upload
 * @returns Download URL of uploaded image
 */
export async function uploadBannerImage(userId: string, file: File): Promise<string> {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // Create storage reference
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `profiles/${userId}/banner.${fileExtension}`);

    // Upload file
    await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            uploadedAt: new Date().toISOString()
        }
    });

    // Get and return download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
}
