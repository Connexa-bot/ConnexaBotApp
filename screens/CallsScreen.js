import React from "react";
import { FlatList } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";

const placeholders = Array(8).fill(null);

export default function CallsScreen() {
  return <FlatList data={placeholders} keyExtractor={(_, i) => i.toString()} renderItem={() => <PlaceholderCard />} />;
}
