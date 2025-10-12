import React from "react";
import { View, Text } from "react-native";

export default function App() {
  console.log("🔴 TEST APP IS RENDERING!");
  
  return (
    <View style={{ flex: 1, backgroundColor: '#FF0000', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#FFFFFF', fontSize: 32 }}>TEST - RED SCREEN</Text>
    </View>
  );
}
