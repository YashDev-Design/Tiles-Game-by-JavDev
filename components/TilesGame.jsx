import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { useTheme } from "../context/ThemeContext";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export default function Tiles() {
  const { theme } = useTheme();
  const router = useRouter();
  const { difficulty } = useLocalSearchParams();
  const { continueGame } = useLocalSearchParams();
  let gridSide = 3;
  if (difficulty === "medium") gridSide = 5;
  if (difficulty === "hard") gridSide = 9;
  const n = gridSide * gridSide;
  const uniqueCount = Math.floor(n / 2);
  const screen = Dimensions.get("window");

  const { width, height } = screen;
  const columns = Math.ceil(Math.sqrt(n)); // approximate square grid
  const rows = Math.ceil(n / columns);
  const horizontalPadding = 40; // adjust to fit padding/margins
  const verticalPadding = 200; // to account for info bar and reset button
  const tileSize = Math.min(
    (width - horizontalPadding) / columns,
    (height - verticalPadding) / rows
  );

  // Generate shuffled array of tile numbers
  const [numbers, setNumbers] = useState(() => {
    const baseNumbers = Array.from({ length: uniqueCount }, (_, i) => i + 1);
    const shuffled = [...baseNumbers, ...baseNumbers].sort(
      () => Math.random() - 0.5
    );
    return shuffled;
  });

  // State variables
  const [flipped, setFlipped] = useState(Array(numbers.length).fill(false));
  const [matched, setMatched] = useState(Array(numbers.length).fill(false));
  const [openTiles, setOpenTiles] = useState([]);

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [steps, setSteps] = useState(0);
  const [bestScore, setBestScore] = useState(null);

  useEffect(() => {
    async function loadGame() {
      if (continueGame !== "true") return;

      try {
        const saved = await AsyncStorage.getItem("savedGame");
        if (!saved) return;

        const data = JSON.parse(saved);

        setNumbers(data.numbers);
        setFlipped(data.flipped);
        setMatched(data.matched);
        setSteps(data.steps);
        setTimeLeft(data.timeLeft);
        setTimerActive(true);
      } catch (err) {
        console.log("Load Error:", err);
      }
    }

    loadGame();
  }, []);

  const timerRef = useRef(null);

  const [showConfetti, setShowConfetti] = useState(false);

  const [sfxOn, setSfxOn] = useState(true);

  useEffect(() => {
    async function loadSfxSetting() {
      const saved = await AsyncStorage.getItem("sfxOn");
      if (saved !== null) setSfxOn(saved === "true");
    }
    loadSfxSetting();
  }, []);

  const clickSound = useRef(null);
  const matchSound = useRef(null);
  const winSound = useRef(null);

  useEffect(() => {
    async function loadSounds() {
      clickSound.current = (await Audio.Sound.createAsync(
        require("../assets/sounds/click.wav")
      )).sound;

      matchSound.current = (await Audio.Sound.createAsync(
        require("../assets/sounds/match.wav")
      )).sound;

      winSound.current = (await Audio.Sound.createAsync(
        require("../assets/sounds/win.wav")
      )).sound;
    }
    loadSounds();
    return () => {
      clickSound.current && clickSound.current.unloadAsync();
      matchSound.current && matchSound.current.unloadAsync();
      winSound.current && winSound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const playSfx = async (type) => {
    if (!sfxOn) return;

    const safePlay = async (soundRef) => {
      try {
        await soundRef.stopAsync();
      } catch {}
      try {
        await soundRef.setPositionAsync(0);
        await soundRef.playAsync();
      } catch {}
    };

    if (type === "click" && clickSound.current) {
      await safePlay(clickSound.current);
      Haptics.selectionAsync();
    }

    if (type === "match" && matchSound.current) {
      await safePlay(matchSound.current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (type === "win" && winSound.current) {
      await safePlay(winSound.current);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // ---------- AUTO SAVE GAME ----------
  const saveLock = useRef(false);

  const saveGame = async () => {
    if (saveLock.current) return;
    saveLock.current = true;

    const data = {
      numbers,
      flipped,
      matched,
      steps,
      timeLeft,
      difficulty,
    };

    try {
      await AsyncStorage.setItem("savedGame", JSON.stringify(data));
    } catch (err) {
      console.log("Save Error:", err);
    }

    setTimeout(() => {
      saveLock.current = false;
    }, 300);
  };

  const handleTilePress = (index) => {
    playSfx("click");
    if (!timerActive) {
      setTimerActive(true);
    }
    if (flipped[index] || matched[index]) return; // Ignore if tile is already flipped or matched
    if (openTiles.length === 2) return;

    setSteps((prev) => prev + 1);
    saveGame();

    const newFlipped = [...flipped];
    newFlipped[index] = true;
    playSfx("match");
    const newOpenTiles = [...openTiles, index];
    setFlipped(newFlipped);
    setOpenTiles(newOpenTiles);

    // When 2 tiles are open
    if (newOpenTiles.length === 2) {
      const [first, second] = newOpenTiles;
      if (numbers[first] === numbers[second]) {
        // It's a match!
        playSfx("match");
        const newMatched = [...matched];
        newMatched[first] = true;
        newMatched[second] = true;
        setMatched(newMatched);
        saveGame();
        setOpenTiles([]);

        // Check for win condition
        if (newMatched.every((val) => val)) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          const secondsTaken = timeLeft;
          const score = Math.max(0, 1000 - (steps * 10 + secondsTaken * 5)); // simple scoring formula
          setShowConfetti(true);
          playSfx("win");
          setTimeout(async () => {
            try {
              if (!bestScore || score > bestScore) {
                await AsyncStorage.setItem("bestScore", score.toString());
                setBestScore(score);
              }
              await AsyncStorage.removeItem("savedGame");
            } catch (error) {
              console.error("Error saving score:", error);
            }

            Alert.alert(
              "🎉 You Won!",
              `All matching tiles found in ${secondsTaken} seconds with ${steps} steps!\n\n🏆 Score: ${score}\n📊 Best Score: ${
                bestScore ? bestScore : score
              }`
            );
          }, 5000);
        }
      } else {
        // Not a match — flip back after short delay
        setTimeout(() => {
          const resetFlipped = [...newFlipped];
          resetFlipped[first] = false;
          resetFlipped[second] = false;
          setFlipped(resetFlipped);
          setOpenTiles([]);
          saveGame();
        }, 800);
      }
    }
  };

  const handleReset = () => {
    AsyncStorage.removeItem("savedGame");
    clearInterval(timerRef.current);
    setTimerActive(false);
    setTimeLeft(0);
    setSteps(0);
    setShowConfetti(false);
    const baseNumbers = Array.from({ length: uniqueCount }, (_, i) => i + 1);
    const shuffled = [...baseNumbers, ...baseNumbers].sort(
      () => Math.random() - 0.5
    );
    setNumbers(shuffled);
    setMatched(Array(shuffled.length).fill(false));
    setFlipped(Array(shuffled.length).fill(false));
    setOpenTiles([]);
    setTimeLeft(0);
    saveGame();
  };

  return (
    <ImageBackground
      source={require("../assets/images/tiles.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {showConfetti && (
        <ConfettiCannon
          count={300}
          origin={{ x: screen.width / 2, y: 0 }}
          fadeOut={true}
          fallSpeed={7000}
          explosionSpeed={850}
          autoStart={true}
        />
      )}
      <Pressable onPress={() => router.back()} style={styles.menuButton}>
        <Text style={styles.menuText}>←</Text>
      </Pressable>
      <View style={[styles.container]}>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>⏱ {timeLeft}s</Text>
          <Text style={styles.infoText}>🪜 Steps: {steps}</Text>
          <Text style={styles.infoText}>🏆 Best: {bestScore || 0}</Text>
        </View>
        <View style={styles.grid}>
          {numbers.map((num, index) => (
            <Pressable
              key={index}
              style={[
                styles.tile,
                { width: tileSize, height: tileSize },
                flipped[index]
                  ? { backgroundColor: theme.surface || "#FFFFFF" }
                  : { backgroundColor: theme.card || "#D1D1D6" },
                matched[index] && {
                  backgroundColor: theme.card
                    ? `${theme.card}80`
                    : "rgba(209, 209, 214, 0.5)",
                  opacity: 0.5,
                },
              ]}
              onPress={() => handleTilePress(index)}
              disabled={matched[index]}
            >
              <Text
                style={[
                  styles.letter,
                  {
                    opacity: flipped[index] || matched[index] ? 1 : 0,
                    color: theme.text,
                  },
                ]}
              >
                {num}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset Game</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuButton: {
    position: "absolute",
    top: 55,
    left: 20,
  },
  menuText: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 6,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "90%",
  },
  tile: {
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  letter: {
    fontSize: 40,
    fontWeight: "600",
  },
  resetButton: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
