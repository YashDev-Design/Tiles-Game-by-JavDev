import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";

export default function useBackgroundMusic(soundOn, musicVolume) {
  const soundRef = useRef(null);
  const volumeRef = useRef(0.5);

  useEffect(() => {
    if (musicVolume !== undefined && soundRef.current) {
      volumeRef.current = musicVolume;
      soundRef.current.setVolumeAsync(musicVolume);
    } else {
      volumeRef.current = musicVolume;
    }
  }, [musicVolume]);

  async function enableAudioMode() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
    } catch (e) {
      console.log("AudioMode Error:", e);
    }
  }

  const playMusic = useCallback(async () => {
    try {
      await enableAudioMode();

      // If sound already loaded, just fade in / raise volume
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(musicVolume ?? volumeRef.current);
        await soundRef.current.playAsync();
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sounds/soft-background-music.mp3"),
        { isLooping: true }
      );
      await sound.setVolumeAsync(musicVolume ?? volumeRef.current);

      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.log("Audio Play Error:", e);
    }
  }, []);

  async function stopMusic() {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(0);
        await soundRef.current.stopAsync();
      }
    } catch (e) {
      console.log("Audio Stop Error:", e);
    }
  }

  async function fadeOutAndMute() {
    try {
      if (!soundRef.current) return;

      let v = musicVolume ?? volumeRef.current;
      const step = v / 5;

      for (let i = 0; i < 5; i++) {
        v -= step;
        if (v < 0) v = 0;
        await soundRef.current.setVolumeAsync(v);
        await new Promise(res => setTimeout(res, 100));
      }

      await soundRef.current.setVolumeAsync(0);
      await soundRef.current.stopAsync();
    } catch (e) {
      console.log("Fade Error:", e);
    }
  }

  useEffect(() => {
    if (soundOn) {
      playMusic();      // fade-in handled inside playMusic
    } else {
      fadeOutAndMute(); // fade-out
    }
    return () => {};
  }, [soundOn, playMusic]);

  return { stopMusic, playMusic };
}
