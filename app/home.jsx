import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import useBackgroundMusic from "../hooks/useBackgroundMusic";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [theme, setTheme] = useState("light");
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [hasSave, setHasSave] = useState(false);
  useBackgroundMusic(soundOn, musicVolume);

  const clickSound = useRef(null);

  useEffect(() => {
    async function loadClick() {
      clickSound.current = (await Audio.Sound.createAsync(
        require("../assets/sounds/click.wav")
      )).sound;
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
      const savedSound = await AsyncStorage.getItem("soundOn");
      const savedSfx = await AsyncStorage.getItem("sfxOn");
      if (savedSound !== null) setSoundOn(savedSound === "true");
      if (savedSfx !== null) setSfxOn(savedSfx === "true");
      const savedVolume = await AsyncStorage.getItem("musicVolume");
      if (savedVolume !== null) setMusicVolume(parseFloat(savedVolume));
      const savedTheme = await AsyncStorage.getItem("appTheme");
      if (savedTheme) setTheme(savedTheme);
      const savedGame = await AsyncStorage.getItem("savedGame");
      if (savedGame) setHasSave(true);
    }
    loadSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function checkSavedGame() {
        const saved = await AsyncStorage.getItem("savedGame");
        setHasSave(!!saved);
      }
      checkSavedGame();
    }, [])
  );

  useEffect(() => {
    AsyncStorage.setItem("soundOn", soundOn.toString());
    AsyncStorage.setItem("sfxOn", sfxOn.toString());
    AsyncStorage.setItem("musicVolume", musicVolume.toString());
  }, [soundOn, sfxOn, musicVolume]);

  return (
    <ImageBackground
      source={require("../assets/images/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Hamburger Menu */}
      <Pressable
        style={styles.menuButton}
        onPress={() => { playClick(); setMenuOpen(!menuOpen); }}
      >
        <Text style={styles.menuText}>☰</Text>
      </Pressable>

      {menuOpen && (
        <View style={styles.menuPanel}>
          <Pressable
            style={styles.menuItem}
            onPress={() => { playClick(); setSoundOn(!soundOn); }}
          >
            <Text style={styles.menuItemText}>
              {soundOn ? "Sound: ON" : "Sound: OFF"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => { playClick(); setSfxOn(!sfxOn); }}
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
        </View>
      )}

      {/* Game Title */}
      <Text style={styles.title}>TILES QUEST</Text>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {!hasSave && (
          <Pressable
            style={styles.button}
            onPress={() => {
              playClick();
              router.push("/game");
            }}
          >
            <Text style={styles.buttonText}>NEW GAME</Text>
          </Pressable>
        )}

        {hasSave && (
          <Pressable
            style={styles.button}
            onPress={() => {
              playClick();
              router.push({
                pathname: "/game",
                params: { continueGame: "true" },
              });
            }}
          >
            <Text style={styles.buttonText}>CONTINUE GAME</Text>
          </Pressable>
        )}

        <Pressable
          style={styles.button}
          onPress={() => { playClick(); router.push("/difficulty"); }}
        >
          <Text style={styles.buttonText}>DIFFICULTY</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => { playClick(); router.push("/settings"); }}
        >
          <Text style={styles.buttonText}>SETTINGS</Text>
        </Pressable>

      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 50,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 3,
  },
  buttonContainer: {
    width: "80%",
    alignItems: "center",
    gap: 20,
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
});
