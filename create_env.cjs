const fs = require('fs');
const content = `PUBLIC_MAPTILER_API_KEY=MpQd0lkqDJcIw363mLYI
# Firebase placeholder
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_STORAGE_BUCKET=
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
PUBLIC_FIREBASE_APP_ID=
`;
fs.writeFileSync('.env', content, { encoding: 'utf8' });
console.log('.env created successfully');
