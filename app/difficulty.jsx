import { useRouter } from "expo-router";
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
import { useRef, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const router = useRouter();
  useBackgroundMusic();

  const clickSound = useRef(null);
  const [sfxOn, setSfxOn] = useState(true);

  useEffect(() => {
    async function loadSfx() {
      const saved = await AsyncStorage.getItem("sfxOn");
      if (saved !== null) setSfxOn(saved === "true");

      clickSound.current = (
        await Audio.Sound.createAsync(require("../assets/sounds/click.wav"))
      ).sound;
    }
    loadSfx();

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

  return (
    <ImageBackground
      source={require("../assets/images/bg.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      {/* Hamburger Menu */}
      <Pressable
        style={styles.menuButton}
        onPress={() => { playClick(); router.back(); }}
      >
        <Text style={styles.menuText}>←</Text>
      </Pressable>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => { 
            playClick(); 
            router.push({ pathname: "/tiles", params: { difficulty: "easy" } }); 
          }}
        >
          <Text style={styles.buttonText}>EASY</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => { 
            playClick(); 
            router.push({ pathname: "/tiles", params: { difficulty: "medium" } }); 
          }}
        >
          <Text style={styles.buttonText}>MEDIUM</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => { 
            playClick(); 
            router.push({ pathname: "/tiles", params: { difficulty: "hard" } }); 
          }}
        >
          <Text style={styles.buttonText}>HARD</Text>
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
});
