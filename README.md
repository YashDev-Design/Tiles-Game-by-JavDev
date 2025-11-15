# 🎮 Tiles Game by JavDev (Yash)  
A polished, fully‑interactive memory puzzle game built with **React Native + Expo** featuring modern UI, sound design, animations, auto‑save, and theme support.

## ✨ Current Features (Fully Implemented)

### 🧩 Core Gameplay  
- Flip tiles to find matching pairs  
- Smooth tile flip animations  
- Timer countdown  
- Step counter  
- Confetti celebration on win  
- Auto-clear saved game on win/reset  

### 🔊 Sound System  
- iOS‑style **click sound** for all UI buttons, toggles, back arrows  
- **Match sound** when each tile flips  
- **Win sound** synced with confetti  
- Haptic feedback for all SFX  
- Global SFX ON/OFF toggle  
- Stable-safe audio playback (no “seeking interrupted” errors)  

### 🎵 Background Music  
- Smooth fading background music  
- Volume slider  
- Music ON/OFF toggle  
- Auto-save settings using AsyncStorage  

### 💾 Auto Save & Continue  
- Game auto-saves after every move, match, mismatch, and reset  
- Home screen shows **Continue Game** if a saved game exists  
- Restores:
  - numbers  
  - flipped state  
  - matched tiles  
  - steps  
  - timer  
  - difficulty mode  

### 🎨 Theme System  
- Menu toggle for **Light / Dark** theme  
- Theme saved permanently using AsyncStorage  

### 🧭 Navigation  
- Home Screen  
- Difficulty Selection  
- Game Screen  
- Settings Screen  

---

## 📁 Project Structure

```
/app
  home.jsx
  difficulty.jsx
  settings.jsx
  game.jsx
/components
  TilesGame.jsx
/assets
  /sounds
    click.wav
    match.wav
    confetti-pop.mp3
  /images …
/hooks
  useBackgroundMusic.js
/context
  Audio settings (optional future expansion)
```

---

## 🚀 How to Run the Project

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npx expo start
```

3. Open on:
- iOS Simulator  
- Android Emulator  
- Expo Go app  

---

## 🛠 Technologies Used  
- React Native  
- Expo  
- Expo Router  
- Expo AV  
- Expo Haptics  
- AsyncStorage  
- Lottie / Confetti  
- GitHub for version control  

---

## 📌 Upcoming Enhancements  
- Theme engine for tiles + board  
- Pause/Resume gameplay  
- Leaderboard (Best Time / Best Steps)  
- Additional animations  

---

## 👨‍💻 Developed by  
**Yash (JavDev)**  
AUM Graduate Student • Full‑Stack Mobile Developer • UI/UX Focus  
https://github.com/YashDev-Design

