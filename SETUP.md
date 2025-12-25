# 🚀 Next Steps - Manual Installation Required

Due to PowerShell execution policy restrictions on your system, automated npm commands cannot run. Please follow these steps to complete the setup:

## Option 1: Enable PowerShell Scripts (Recommended)

Open PowerShell as Administrator and run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then restart your IDE and run:
```bash
npm install
npm run dev
```

## Option 2: Use Alternative Package Managers

### Using Yarn:
```bash
yarn install
yarn dev
```

### Using PNPM:
```bash
pnpm install
pnpm dev
```

## Option 3: Use Git Bash or WSL

If you have Git Bash or Windows Subsystem for Linux installed:
```bash
npm install
npm run dev
```

## After Installation

1. **Create your `.env` file**:
   ```bash
   cp .env.example .env
   ```

2. **Get your MapTiler API Key**:
   - Go to https://www.maptiler.com/cloud/
   - Sign up for free
   - Create an API key
   - Add it to `.env`:
     ```
     PUBLIC_MAPTILER_API_KEY=your_actual_key_here
     ```

3. **Set up Firebase** (optional for now, needed for Phase 3):
   - Go to https://console.firebase.google.com/
   - Create a new project
   - Enable Firestore and Authentication
   - Copy your config values to `.env`

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to http://localhost:5173

6. **Allow location access** when prompted

You should see a dark map with your current location marked with a pulsing cyan marker! 🎉

## Troubleshooting

- **Map not loading**: Check that your MapTiler API key is correct
- **Location not working**: Grant location permissions in your browser
- **Build errors**: Make sure all dependencies installed successfully

## What's Working Now

✅ Full-screen map with dark theme
✅ Real-time geolocation tracking
✅ Animated user position marker
✅ PWA configuration (ready for deployment)
✅ Responsive mobile design

## Coming Next (Future Phases)

- Hexagonal territory grid overlay
- Click to challenge territories
- Chess game modal
- Territory conquest system
- Firebase persistence
