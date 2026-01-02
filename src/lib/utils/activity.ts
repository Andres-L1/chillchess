import { db } from '$lib/firebase';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export async function trackActivity(userId: string) {
    if (!userId) return;

    const now = new Date();
    // Format YYYY-MM-DD
    const dateKey = now.toISOString().split('T')[0];
    const userRef = doc(db, 'users', userId);

    try {
        // Increment the count for today's date in specific map
        await updateDoc(userRef, {
            [`activityMap.${dateKey}`]: increment(1),
            lastActive: serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging activity:", error);
    }
}
