import { db } from '$lib/firebase';
import { doc, updateDoc, increment, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';

/**
 * Tracks a site visit in Firestore.
 * Uses a daily counter to keep track of visits.
 */
export async function trackVisit() {
    if (typeof window === 'undefined') return;

    // Check if we've already tracked this session to avoid over-counting on reloads
    const SESSION_KEY = 'chillchess_visited_session';
    const lastVisit = sessionStorage.getItem(SESSION_KEY);
    
    // If already tracked in this session, don't track again
    if (lastVisit) return;

    try {
        const now = new Date();
        const dateId = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const statsRef = doc(db, 'stats', 'global');
        const dailyStatsRef = doc(db, 'stats', `daily_${dateId}`);

        // Update global stats
        try {
            await updateDoc(statsRef, {
                totalVisits: increment(1),
                lastVisit: serverTimestamp()
            });
        } catch (e: any) {
            if (e.code === 'not-found') {
                await setDoc(statsRef, {
                    totalVisits: 1,
                    lastVisit: serverTimestamp()
                }, { merge: true });
            }
        }

        // Update daily stats for charts
        try {
             await updateDoc(dailyStatsRef, {
                count: increment(1),
                date: dateId,
                timestamp: serverTimestamp()
            });
        } catch (e: any) {
            if (e.code === 'not-found') {
                await setDoc(dailyStatsRef, {
                    count: 1,
                    date: dateId,
                    timestamp: serverTimestamp()
                }, { merge: true });
            }
        }

        // Mark as tracked in session
        sessionStorage.setItem(SESSION_KEY, 'true');
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}
