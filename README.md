# ChillChess PWA 🎮♟️

A geo-localized Progressive Web App where users conquer hexagonal territories on a real-world map by playing chess games.

## 🚀 Tech Stack

- **Frontend**: SvelteKit + TypeScript
- **Maps**: MapLibre GL JS
- **Database**: Firebase (Firestore + Auth)
- **Deployment**: Netlify
- **Styling**: Tailwind CSS
- **Chess Logic**: chess.js + stockfish.js
- **Territory System**: h3-js (Uber's hexagonal grid)

## 🎨 Design Philosophy

ChillChess combines the strategic depth of chess with real-world exploration. The "Chill" aesthetic features:
- Dark mode UI with neon accents (Cyan, Pink, Violet)
- Glassmorphism effects
- Smooth animations and glow effects
- Lofi hip-hop vibes

## 📦 Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd ChillChess
```

2. **Install dependencies**

⚠️ **Note**: If you encounter PowerShell execution policy errors, you have two options:

**Option A**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Option B**: Use alternative package managers:
```bash
# Using Yarn
yarn install

# Or using PNPM
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
- Get a MapTiler API key from https://www.maptiler.com/cloud/ (free tier available)
- Create a Firebase project at https://console.firebase.google.com/

4. **Run the development server**
```bash
npm run dev
```

Visit http://localhost:5173

## 🎯 Current Features (Phase 1)

- ✅ Full-screen interactive map
- ✅ Real-time geolocation tracking
- ✅ Animated user position marker
- ✅ Dark "Chill" themed UI
- ✅ PWA-ready configuration
- ✅ Mobile-optimized

## 🗺️ Roadmap

### Phase 1: Project Setup ✅
- SvelteKit + TypeScript configuration
- Tailwind CSS integration
- PWA manifest and service worker

### Phase 2: Map Integration ✅
- MapLibre GL with dark theme
- Geolocation API
- User position tracking

### Phase 3 & 4: Hexagon Territory System ✅
- h3-js hexagonal grid overlay
- Click interaction for nearby hexagons
- Distance verification with turf.js
- Territory ownership visualization
- Firebase integration ready

### Phase 5: Chess Integration (Next)
- Chess board component
- chess.js game logic
- stockfish.js AI opponent
- Territory conquest on win

### Phase 6: Firebase Complete Setup (Optional)
- Enhanced user authentication
- Leaderboards
- Multiplayer features

### Phase 7: Production PWA Deployment ✅
- Netlify hosting
- Custom domain (chillchess.app)
- \"Add to Home Screen\" functionality
- Offline support

## 🔥 Firebase Configuration

To enable territory persistence:

1. **Create a Firebase project** at https://console.firebase.google.com/

2. **Enable Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode** (for development)
   - Choose your region

3. **Get your Firebase config**:
   - Project Settings → General → Your apps
   - Click "Web" (</>) to add a web app
   - Copy the `firebaseConfig` object values

4. **Add to your `.env`**:
```env
PUBLIC_FIREBASE_API_KEY=AIzaSy...
PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your-project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
```

5. **Enable Anonymous Auth** (for easy onboarding):
   - Authentication → Sign-in method → Anonymous → Enable

6. **(Production) Set security rules** in Firestore:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /territories/{territoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

The app will work without Firebase (hexagons render fine), but conquests won't persist.

## 🔧 Development Notes

### PWA Limitations
Web apps cannot track GPS in the background when the phone is locked. ChillChess is designed for **active play**:
1. User walks to a location
2. Opens the app
3. Sees nearby territories
4. Plays chess to conquer
5. Continues exploring

### Icon Customization
The current icons are SVG placeholders. To create custom PNG icons:

1. Design your icon (512x512px and 192x192px)
2. Export as PNG
3. Replace `static/icon-512.svg` → `static/icon-512.png`
4. Replace `static/icon-192.svg` → `static/icon-192.png`
5. Update `vite.config.js` if needed

Or use a tool like [PWA Asset Generator](https://www.npmjs.com/package/pwa-asset-generator):
```bash
npx pwa-asset-generator your-icon.svg static --icon-only
```

## 📱 Testing the PWA

1. Build the production version:
```bash
npm run build
npm run preview
```

2. Deploy to Netlify (see deployment section below)

3. On mobile, visit the deployed URL and look for "Add to Home Screen"

## 🌐 Deployment to Netlify

1. Push your code to GitHub
2. Go to https://app.netlify.com/
3. Click "Add new site" → "Import from GitHub"
4. Select your repository
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
6. Add environment variables in Netlify dashboard
7. (Optional) Configure custom domain in Domain settings

## 🤝 Contributing

This is a personal project, but suggestions and issues are welcome!

## 📄 License

MIT

---

Made with 💙 by the ChillChess team
