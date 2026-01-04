import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Cloud Function que se ejecuta cada hora para enviar recordatorios de hábitos
 * Se ejecuta automáticamente usando Cloud Scheduler
 */
export const sendHabitReminders = functions.pubsub
    .schedule('every 1 hours')
    .timeZone('Europe/Madrid')
    .onRun(async (context) => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`Running sendHabitReminders at ${currentHour}:${currentMinute}`);

        try {
            // Obtener todos los hábitos que tienen notificaciones activadas
            const habitsSnapshot = await db.collection('habits')
                .where('notification', '==', true)
                .get();

            if (habitsSnapshot.empty) {
                console.log('No habits with notifications enabled');
                return null;
            }

            const notifications: Promise<any>[] = [];

            for (const habitDoc of habitsSnapshot.docs) {
                const habit = habitDoc.data();
                const habitId = habitDoc.id;

                // Verificar si tiene hora configurada
                if (!habit.notTime) continue;

                // Parsear la hora (formato HH:mm)
                const [habitHour, habitMinute] = habit.notTime.split(':').map(Number);

                // Verificar si es la hora correcta (con tolerancia de ±5 minutos)
                const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (habitHour * 60 + habitMinute));
                if (timeDiff > 5) continue; // Ignorar si no está dentro de la ventana de 5 minutos

                // Obtener el usuario para conseguir su FCM token
                const userSnapshot = await db.collection('users')
                    .doc(habit.userId)
                    .get();

                if (!userSnapshot.exists) continue;

                const userData = userSnapshot.data();
                const fcmToken = userData?.fcmToken;

                if (!fcmToken) {
                    console.log(`User ${habit.userId} has no FCM token`);
                    continue;
                }

                // Verificar si ya completó el hábito hoy
                const today = new Date().toISOString().split('T')[0];
                const todayEvent = habit.events?.[today];

                if (todayEvent?.type === 'check') {
                    console.log(`Habit ${habitId} already completed today`);
                    continue; // Ya completado, no enviar recordatorio
                }

                // Preparar el mensaje
                const message = {
                    token: fcmToken,
                    notification: {
                        title: '🔥 Recordatorio de hábito',
                        body: `No olvides: ${habit.title}`,
                    },
                    data: {
                        habitId: habitId,
                        type: 'habit_reminder',
                        url: '/app',
                    },
                    webpush: {
                        fcmOptions: {
                            link: 'https://chillchess.app/app'
                        }
                    }
                };

                // Enviar notificación
                notifications.push(
                    messaging.send(message)
                        .then((response) => {
                            console.log(`Notification sent for habit ${habitId}:`, response);
                            return response;
                        })
                        .catch((error) => {
                            console.error(`Error sending notification for habit ${habitId}:`, error);
                            // Si el token es inválido, limpiarlo
                            if (error.code === 'messaging/invalid-registration-token' ||
                                error.code === 'messaging/registration-token-not-registered') {
                                return db.collection('users').doc(habit.userId).update({
                                    fcmToken: admin.firestore.FieldValue.delete()
                                });
                            }
                            throw error;
                        })
                );
            }

            // Esperar a que todas las notificaciones se envíen
            const results = await Promise.allSettled(notifications);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;

            console.log(`Sent ${successful} notifications, ${failed} failed`);
            return { successful, failed };

        } catch (error) {
            console.error('Error in sendHabitReminders:', error);
            throw error;
        }
    });

/**
 * Cloud Function HTTP para testear el envío de una notificación manualmente
 * Útil para debugging: https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/testNotification?userId=USER_ID
 */
export const testNotification = functions.https.onRequest(async (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        res.status(400).send('Missing userId parameter');
        return;
    }

    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            res.status(404).send('User not found');
            return;
        }

        const userData = userDoc.data();
        const fcmToken = userData?.fcmToken;

        if (!fcmToken) {
            res.status(400).send('User has no FCM token');
            return;
        }

        const message = {
            token: fcmToken,
            notification: {
                title: '🎯 Test de notificación',
                body: 'Si recibes esto, ¡las notificaciones funcionan!',
            },
            data: {
                type: 'test',
            }
        };

        const response = await messaging.send(message);
        res.json({ success: true, messageId: response });

    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: String(error) });
    }
});
