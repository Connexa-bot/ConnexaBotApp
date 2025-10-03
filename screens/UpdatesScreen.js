import React from "react";
import { FlatList } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
const dummyUpdates = [
  { id: 1, title: "Status placeholder" },
  { id: 2, title: "Channel placeholder" },
];

export default function UpdatesScreen() {
  return (
    <FlatList
      data={dummyUpdates}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PlaceholderCard title={item.title} />}
    />
  );
}
