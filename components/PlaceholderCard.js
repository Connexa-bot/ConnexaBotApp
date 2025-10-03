import React from "react";
import { View, StyleSheet, Animated } from "react-native";
export default function PlaceholderCard({ title }) {
  const opacity = new Animated.Value(0.3);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity }]}>
      <View style={styles.avatar} />
      <View style={styles.textContainer}>
        <View style={styles.line} />
        <View style={[styles.line, { width: "60%" }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#ccc" },
  textContainer: { marginLeft: 10, flex: 1 },
  line: { height: 10, backgroundColor: "#ddd", marginVertical: 4, borderRadius: 4 },
});
