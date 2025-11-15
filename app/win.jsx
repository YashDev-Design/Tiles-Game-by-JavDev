import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { Audio } from "expo-av";

export default function WinScreen() {
  const router = useRouter();
  const { score, steps, secondsTaken, difficulty } = useLocalSearchParams();
  const [showConfetti, setShowConfetti] = useState(false);
  const titleScale = React.useRef(new Animated.Value(0.5)).current;
  const titleOpacity = React.useRef(new Animated.Value(0)).current;
  const cardOpacity = React.useRef(new Animated.Value(0)).current;
  const cardTranslate = React.useRef(new Animated.Value(30)).current;
  const [confettiSound, setConfettiSound] = useState(null);

  useEffect(() => {
    setShowConfetti(true);

    // Play confetti pop sound
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/sounds/confetti-pop.mp3")
        );
        setConfettiSound(sound);
        await sound.playAsync();
      } catch (e) {
        console.log("Confetti sound error:", e);
      }
    }
    loadSound();

    // Title & card animations
    Animated.parallel([
      Animated.timing(titleScale, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslate, {
        toValue: 0,
        duration: 400,
        delay: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();

    return () => {
      confettiSound && confettiSound.unloadAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      {showConfetti && (
        <LottieView
          source={require("../assets/confetti.json")}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      )}

      <Animated.Text
        style={[
          styles.title,
          { opacity: titleOpacity, transform: [{ scale: titleScale }] }
        ]}
      >
        🎉 You Won!
      </Animated.Text>

      <Animated.View
        style={[
          styles.card,
          { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }
        ]}
      >
        <Text style={styles.info}>⏱ Time: {secondsTaken} seconds</Text>
        <Text style={styles.info}>🧠 Steps: {steps}</Text>
        <Text style={styles.info}>⭐ Score: {score}</Text>
        <Text style={styles.info}>🎚 Difficulty: {difficulty}</Text>
      </Animated.View>

      <Pressable
        style={styles.button}
        onPress={() => router.replace(`/game?difficulty=${difficulty}`)}
      >
        <Text style={styles.btnText}>Play Again</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/difficulty")}
      >
        <Text style={styles.btnText}>Change Difficulty</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.btnText}>Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    width: "90%",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },
  info: {
    fontSize: 20,
    color: "#fff",
    marginVertical: 5,
  },
  button: {
    width: "90%",
    backgroundColor: "#ff9800",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  confetti: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});
