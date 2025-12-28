# Instrucciones para asignar Admin

## Opción 1: Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto ChillChess
3. En el menú izquierdo: **Firestore Database**
4. Busca la colección `users`
5. Encuentra tu documento de usuario por email: `andreslgumuzio@gmail.com`
6. Haz clic en el documento
7. Haz clic en **"Add field"** (o editar si ya existe)
8. Campo: `isAdmin`
9. Tipo: `boolean`
10. Valor: `true`
11. Guardar

## Opción 2: Firebase Admin SDK (Programático)

Si quieres automatizarlo en el futuro, necesitarás crear una Cloud Function:

```javascript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const makeAdmin = functions.https.onCall(async (data, context) => {
    // Solo el usuario admin puede ejecutar esto
    if (context.auth?.token.email !== 'andreslgumuzio@gmail.com') {
        throw new functions.https.HttpsError('permission-denied', 'No autorizado');
    }
    
    const { email } = data;
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
        throw new functions.https.HttpsError('not-found', 'Usuario no encontrado');
    }
    
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ isAdmin: true });
    
    return { success: true };
});
```

## Tu Usuario Admin

**Email:** andreslgumuzio@gmail.com
**Username:** WhiteL1

Una vez agregues `isAdmin: true` en Firestore, podrás acceder a:
- **Panel Admin**: https://chillchess.app/admin
