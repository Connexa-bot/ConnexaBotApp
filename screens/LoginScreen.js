import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to WhatsApp</Text>
      <Text style={styles.subtext}>QR Code & Pairing Code will appear here</Text>
      <Button title="Continue" onPress={() => navigation.replace("Main")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 20, fontWeight: "bold" },
  subtext: { marginVertical: 10, fontSize: 14, color: "gray", textAlign: "center" },
});
