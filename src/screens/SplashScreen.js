import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

// The SplashScreen now receives an `onFinish` prop to signal when it's done.
export default function SplashScreen({ onFinish }) {
  useEffect(() => {
    // After 2 seconds, call the onFinish function provided by the navigator.
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ConnexaBotApp</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#075E54" },
  logo: { fontSize: 28, fontWeight: "bold", color: "white" },
});