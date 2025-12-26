const fs = require('fs');

const envContent = `# MapTiler API Key
PUBLIC_MAPTILER_API_KEY=MpQd0lkqDJcIw363mLYI

# Firebase Configuration
PUBLIC_FIREBASE_API_KEY=AIZaSyDkAPVdrwASXA-O5ajBU7I14qbKSfef5EI
PUBLIC_FIREBASE_AUTH_DOMAIN=chillchess-57365.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=chillchess-57365
PUBLIC_FIREBASE_STORAGE_BUCKET=chillchess-57365.firebasestorage.app
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=676151034372
PUBLIC_FIREBASE_APP_ID=1:676151034372:web:4124fbdfd7fee5dfee2b51
`;

fs.writeFileSync('.env', envContent, 'utf8');
console.log('✅ .env file created successfully with Firebase credentials!');
