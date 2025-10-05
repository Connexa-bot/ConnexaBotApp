import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    setTimeout(() => navigation.replace("Login"), 2000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>WhatsApp Clone</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#075E54" },
  logo: { fontSize: 28, fontWeight: "bold", color: "white" },
});
