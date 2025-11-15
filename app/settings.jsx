import { View, Text, Pressable, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useRef } from "react";

export default function SettingsScreen() {
  const router = useRouter();

  const [soundOn, setSoundOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);

  const clickSound = useRef(null);

  useEffect(() => {
    async function loadClick() {
      clickSound.current = (
        await Audio.Sound.createAsync(
          require("../assets/sounds/click.wav")
        )
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
    async function load() {
      const savedSound = await AsyncStorage.getItem("soundOn");
      const savedSfx = await AsyncStorage.getItem("sfxOn");
      const savedVolume = await AsyncStorage.getItem("musicVolume");

      if (savedSound !== null) setSoundOn(savedSound === "true");
      if (savedSfx !== null) setSfxOn(savedSfx === "true");
      if (savedVolume !== null) setMusicVolume(parseFloat(savedVolume));
    }
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("soundOn", soundOn.toString());
    AsyncStorage.setItem("sfxOn", sfxOn.toString());
    AsyncStorage.setItem("musicVolume", musicVolume.toString());
  }, [soundOn, sfxOn, musicVolume]);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => { playClick(); router.back(); }} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Settings</Text>

      <Pressable
        style={styles.toggle}
        onPress={() => { playClick(); setSoundOn(!soundOn); }}
      >
        <Text style={styles.toggleText}>
          {soundOn ? "Background Music: ON" : "Background Music: OFF"}
        </Text>
      </Pressable>

      <Pressable
        style={styles.toggle}
        onPress={() => { playClick(); setSfxOn(!sfxOn); }}
      >
        <Text style={styles.toggleText}>
          {sfxOn ? "Sound Effects (SFX): ON" : "Sound Effects (SFX): OFF"}
        </Text>
      </Pressable>

      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Music Volume</Text>
        <Slider
          style={{ width: 250, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          value={musicVolume}
          onValueChange={(v) => setMusicVolume(v)}
          minimumTrackTintColor="#ffa500"
          maximumTrackTintColor="#aaa"
          thumbTintColor="#fff"
        />
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={() => { playClick(); router.back(); }}
      >
        <Text style={styles.saveText}>Save & Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 80,
    paddingHorizontal: 25,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "700",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffa500",
    marginBottom: 40,
  },
  toggle: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  sliderContainer: {
    marginTop: 20,
  },
  sliderLabel: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#ffa500",
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 40,
    alignItems: "center",
  },
  saveText: {
    color: "#111",
    fontSize: 20,
    fontWeight: "700",
  },
});