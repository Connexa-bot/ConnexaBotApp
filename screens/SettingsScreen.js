import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeContext } from "../contexts/ThemeContext";

export default function SettingsScreen() {
  const { mode, setMode } = useThemeContext();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.option} onPress={() => setMode("light")}>
        <Text>🌞 Light Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => setMode("dark")}>
        <Text>🌙 Dark Mode</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option} onPress={() => setMode("system")}>
        <Text>⚡ System Default</Text>
      </TouchableOpacity>

      <Text style={styles.current}>Current: {mode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  option: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  current: { marginTop: 20, fontSize: 14, color: "gray" },
});
