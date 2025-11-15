import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import useBackgroundMusic from "../hooks/useBackgroundMusic";

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(1);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    async function loadSettings() {
      const s = await AsyncStorage.getItem("soundOn");
      const fx = await AsyncStorage.getItem("sfxOn");
      const vol = await AsyncStorage.getItem("musicVolume");
      const th = await AsyncStorage.getItem("appTheme");

      if (s !== null) setSoundOn(s === "true");
      if (fx !== null) setSfxOn(fx === "true");
      if (vol !== null) setMusicVolume(Number(vol));
      if (th !== null) setTheme(th);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("soundOn", soundOn.toString());
    AsyncStorage.setItem("sfxOn", sfxOn.toString());
    AsyncStorage.setItem("musicVolume", musicVolume.toString());
    AsyncStorage.setItem("appTheme", theme);
  }, [soundOn, sfxOn, musicVolume, theme]);

  const menuSlide = useRef(new Animated.Value(-200)).current;

  const [bestScore, setBestScore] = useState(null);

  useBackgroundMusic(soundOn, musicVolume);

  const clickSound = useRef(null);

  useEffect(() => {
    async function loadClick() {
      clickSound.current = (
        await Audio.Sound.createAsync(require("../assets/sounds/click.wav"))
      ).sound;
    }
    loadClick();
    return () => {
      clickSound.current && clickSound.current.unloadAsync();
    };
  }, []);

  const playClick = async () => {
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

    if (clickSound.current) {
      await safePlay(clickSound.current);
      Haptics.selectionAsync();
    }
  };

  useEffect(() => {
    async function loadSettings() {
      const best = await AsyncStorage.getItem("bestScore");
      if (best) setBestScore(best);
    }
    loadSettings();
  }, []);

  return (
    <ImageBackground
      source={require("../assets/images/bg.jpg")}
      style={styles.bgFull}
      resizeMode="cover"
    >
      <View style={styles.screenContent}>
        {/* Hamburger Menu */}
        <Pressable
          style={styles.menuButton}
          onPress={() => {
            playClick();
            setMenuOpen(!menuOpen);
            Animated.timing(menuSlide, {
              toValue: menuOpen ? -200 : 0,
              duration: 300,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }).start();
          }}
        >
          <Text style={styles.menuText}>☰</Text>
        </Pressable>

        {menuOpen && (
          <Animated.View style={[styles.menuPanel, { left: menuSlide }]}>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                playClick();
                setSoundOn(!soundOn);
              }}
            >
              <Text style={styles.menuItemText}>
                {soundOn ? "Sound: ON" : "Sound: OFF"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                playClick();
                setSfxOn(!sfxOn);
              }}
            >
              <Text style={styles.menuItemText}>
                {sfxOn ? "SFX: ON" : "SFX: OFF"}
              </Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={async () => {
                playClick();
                const newTheme = theme === "light" ? "dark" : "light";
                setTheme(newTheme);
                await AsyncStorage.setItem("appTheme", newTheme);
              }}
            >
              <Text style={styles.menuItemText}>
                Theme: {theme === "light" ? "Light" : "Dark"}
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Game Title */}
        <View style={{ height: 40 }} />
        <Text style={styles.title}>TILES QUEST</Text>

        {bestScore && (
          <View style={styles.leaderboardCard}>
            <Text style={styles.leaderboardTitle}>🏆 BEST SCORE</Text>
            <Text style={styles.leaderboardValue}>{bestScore}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => {
              playClick();
              router.push("/game");
            }}
          >
            <Text style={styles.buttonText}>NEW GAME</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => {
              playClick();
              router.push("/difficulty");
            }}
          >
            <Text style={styles.buttonText}>DIFFICULTY</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgFull: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  screenContent: {
    flex: 1,
    paddingTop: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    flex: 1,
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
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 30,
    marginTop: -20,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },
  buttonContainer: {
    width: "85%",
    alignItems: "center",
    gap: 30,
    marginTop: 10,
  },
  button: {
    width: "65%",
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
  },
  buttonText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },
  menuPanel: {
    position: "absolute",
    top: 100,
    left: 20,
    width: 180,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  menuItem: {
    paddingVertical: 8,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  leaderboardCard: {
    backgroundColor: "rgba(0,0,0,0.55)",
    padding: 12,
    borderRadius: 14,
    marginBottom: 30,
    width: "70%",
    alignItems: "center",
  },
  leaderboardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  leaderboardValue: {
    color: "#ffeb3b",
    fontSize: 22,
    fontWeight: "800",
  },
});
