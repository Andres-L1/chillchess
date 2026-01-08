/**
 * Cloudflare Worker para enviar notificaciones de hábitos
 * Se ejecuta cada hora usando Cron Triggers
 */

import * as jwt from '@tsndr/cloudflare-worker-jwt';

interface Env {
    FB_PROJECT_ID: string;
    FB_SERVICE_ACCOUNT: string;
}

interface Habit {
    id: string;
    userId: string;
    title: string;
    notification: boolean;
    notTime?: string;
    events?: Record<string, any>;
}

interface User {
    fcmToken?: string;
}

export default {
    async scheduled(event: any, env: Env, ctx: any): Promise<void> {
        console.log('Running habit notifications cron...');

        try {
            const now = new Date();
            const madridTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
            const currentHour = madridTime.getHours();
            const currentMinute = madridTime.getMinutes();
            const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            const today = madridTime.toISOString().split('T')[0];

            console.log(`Current time (Madrid): ${currentTime}, Date: ${today}`);

            const serviceAccount = JSON.parse(env.FB_SERVICE_ACCOUNT);
            const firebaseToken = await getFirebaseToken(serviceAccount);

            const habitsUrl = `https://firestore.googleapis.com/v1/projects/${env.FB_PROJECT_ID}/databases/(default)/documents/habits`;
            const habitsResponse = await fetch(habitsUrl, {
                headers: { Authorization: `Bearer ${firebaseToken}` },
            });

            if (!habitsResponse.ok) {
                console.error('Error fetching habits:', await habitsResponse.text());
                return;
            }

            const habitsData: any = await habitsResponse.json();
            const habits = habitsData.documents || [];

            let notificationsSent = 0;

            for (const habitDoc of habits) {
                const habit = parseFirestoreDoc(habitDoc);

                if (!habit.notification || !habit.notTime) continue;

                const [habitHour, habitMinute] = habit.notTime.split(':').map(Number);
                const timeDiff = Math.abs(currentHour * 60 + currentMinute - (habitHour * 60 + habitMinute));

                if (timeDiff > 30) continue;

                const todayEvent = habit.events?.[today];
                if (todayEvent?.type === 'check') {
                    console.log(`Habit ${habit.id} already completed today`);
                    continue;
                }

                const userUrl = `https://firestore.googleapis.com/v1/projects/${env.FB_PROJECT_ID}/databases/(default)/documents/users/${habit.userId}`;
                const userResponse = await fetch(userUrl, {
                    headers: { Authorization: `Bearer ${firebaseToken}` },
                });

                if (!userResponse.ok) continue;

                const userData: any = await userResponse.json();
                const user = parseFirestoreDoc(userData);
                const fcmToken = user.fcmToken;

                if (!fcmToken) {
                    console.log(`User ${habit.userId} has no FCM token`);
                    continue;
                }

                const sent = await sendFCMNotification(fcmToken, habit, firebaseToken);
                if (sent) {
                    notificationsSent++;
                    console.log(`Notification sent for habit: ${habit.title}`);
                }
            }

            console.log(`Total notifications sent: ${notificationsSent}`);
        } catch (error) {
            console.error('Error in scheduled function:', error);
        }
    },
};

async function getFirebaseToken(serviceAccount: any): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: serviceAccount.client_email,
        scope: 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase.messaging',
        aud: 'https://oauth2.googleapis.com/token',
        exp: now + 3600,
        iat: now,
    };

    const token = await jwt.sign(claim, serviceAccount.private_key, { algorithm: 'RS256' });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: token,
        }),
    });

    const tokenData: any = await tokenResponse.json();
    return tokenData.access_token;
}

async function sendFCMNotification(fcmToken: string, habit: Habit, firebaseToken: string): Promise<boolean> {
    try {
        const message = {
            message: {
                token: fcmToken,
                notification: {
                    title: '🔥 Recordatorio de hábito',
                    body: `No olvides: ${habit.title}`,
                },
                data: {
                    habitId: habit.id,
                    type: 'habit_reminder',
                    url: '/app',
                },
                webpush: {
                    fcmOptions: {
                        link: 'https://chillchess.app/app',
                    },
                },
            },
        };

        const response = await fetch('https://fcm.googleapis.com/v1/projects/chillchess-57365/messages:send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${firebaseToken}`,
            },
            body: JSON.stringify(message),
        });

        return response.ok;
    } catch (error) {
        console.error('Error sending FCM:', error);
        return false;
    }
}

function parseFirestoreDoc(doc: any): any {
    const fields = doc.fields || {};
    const result: any = { id: doc.name?.split('/').pop() };

    for (const [key, value] of Object.entries(fields)) {
        const field: any = value;
        if (field.stringValue !== undefined) result[key] = field.stringValue;
        else if (field.booleanValue !== undefined) result[key] = field.booleanValue;
        else if (field.integerValue !== undefined) result[key] = parseInt(field.integerValue);
        else if (field.mapValue) result[key] = parseFirestoreDoc({ fields: field.mapValue.fields });
    }

    return result;
}
