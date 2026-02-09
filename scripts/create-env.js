import fs from 'node:fs';

const envContent = `VITE_FIREBASE_API_KEY=AIZaSyDkAPVdrwASXA-O5ajBU7I14qbKSfef5EI
VITE_FIREBASE_AUTH_DOMAIN=chillchess-57365.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=chillchess-57365
VITE_FIREBASE_STORAGE_BUCKET=chillchess-57365.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=676151034372
VITE_FIREBASE_APP_ID=1:676151034372:web:4124fbdfd7fee5dfee2b51
VITE_FIREBASE_VAPID_KEY=BKw5D5y7z9y5z9y5z9y5z9y5z9y5z9y5z9y5z9y5
PUBLIC_R2_ACCOUNT_ID=1ad53c96c0d4d61512c0b69d0221c82d
R2_ACCESS_KEY_ID=e0af12b78758cabe75b10a7bba390561
R2_SECRET_ACCESS_KEY=cb4033276733f74ffab37dd17a6885925943652931915e2734ba9895e8252fbe
R2_BUCKET_NAME=chillchess-music`;

try {
    fs.writeFileSync('.env.production', envContent);
    console.log('✅ .env.production created successfully with hardcoded values');
    console.log('Content preview:', envContent.split('\n')[0]); // Log only API key just to be sure
} catch (error) {
    console.error('❌ Failed to create .env.production:', error);
    process.exit(1);
}
