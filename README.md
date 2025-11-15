# 🎮 Tiles Game by JavDev (Yash)  
A fast, modern, difficulty‑adaptive memory puzzle game built with **React Native + Expo**, featuring dynamic grids, difficulty modes, animations, sound design, haptics, and a brand‑new SUPER HARD mode.

---

# ✨ Latest Features (Updated)

## 🧩 Core Gameplay  
- Flip tiles to match identical pairs  
- Smooth tile flip animations  
- **Dynamic grid sizes based on difficulty:**
  - EASY → **2×2** (4 tiles)
  - MEDIUM → **4×4** (16 tiles)
  - HARD → **6×6** (36 tiles)
  - SUPER HARD → **9×9** (81 tiles, separate screen)
- Step counter  
- Clean UI layout auto-adjusts for every grid size  

---

## 🔥 SUPER HARD MODE (New)  
A separate ultra‑challenging mode:
- **9×9 grid** (81 tiles)
- **100‑second countdown timer**
- Timer counts **down to 0**
- Auto-reset logic
- Optimized layout for large tile grids
- Back arrow safely resets timer + returns to home screen

This mode does NOT affect normal difficulty gameplay.

---

## 🔊 Sound & Haptics  
- iOS‑style click sound for all UI interactions  
- Match sound on tile flip  
- Win sound synced with confetti  
- Haptic feedback for tile interactions  
- SFX toggle (internally stored via AsyncStorage)  
- Background music system with:
  - ON/OFF toggle  
  - Volume slider  
  - Smooth fade in/out transitions  

---

## 🎵 Background Music  
- Plays automatically by default  
- Respects music volume from AsyncStorage  
- Smooth fade‑out on game exit  
- SFX & BGM logic fixed across screens  
- Safe playback (no “seeking interrupted” issues)

---

## 🎉 Animations  
- Confetti celebration on win  
- Lottie-driven win screen  
- Back button + UI elements support sound + haptics  
- Adaptive number sizing (font scale changes based on tile size)

---

## 🧭 Navigation Flow  
- **Home Screen**
  - New Game  
  - Difficulty Modes  
  - Super Hard Mode  
- **Difficulty Screen**
  - EASY → 2×2  
  - MEDIUM → 4×4  
  - HARD → 6×6  
  - SUPER HARD → external screen  
- **Game Screen**
  - Dynamic grid rendering  
  - Timer  
  - Reset  
  - Back arrow → always routes safely to home  
- **Super Hard Screen**
  - Dedicated 9×9 grid  
  - Countdown timer  
  - Extreme challenge  

---

## 📁 Updated Project Structure

```
/app
  home.jsx
  difficulty.jsx
  superhard.jsx
  win.jsx
/components
  TilesGame.jsx
/assets
  /sounds (click.wav, match.wav, confetti-pop.mp3)
  /images (backgrounds, icons)
/hooks
  useBackgroundMusic.js
/context
  (reserved for future global audio/theme expansion)
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

3. Open using:
- iOS Simulator  
- Android Emulator  
- Expo Go App  

---

## 🛠 Technologies Used  
- React Native  
- Expo  
- Expo Router  
- Expo AV  
- Expo Haptics  
- AsyncStorage  
- Lottie  
- Confetti  
- GitHub  

---

## 📌 New Roadmap  
- Auto-fail popup when super hard timer hits 0  
- Themed backgrounds per difficulty level  
- Leaderboard system (best time / best steps)  
- New tile textures + animations  
- Save system rework (optional future return)

---

## 👨‍💻 Developed by  
**Yash (JavDev)**  
Graduate Student @ AUM • Full‑Stack Mobile Developer • UI/UX Specialist  
GitHub: https://github.com/YashDev-Design
