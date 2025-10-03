import React from "react";
import { FlatList } from "react-native";
import PlaceholderCard from "../components/PlaceholderCard";
const dummyCommunities = [
  { id: 1, title: "Group placeholder" },
  { id: 2, title: "Community placeholder" },
];

export default function CommunitiesScreen() {
  return (
    <FlatList
      data={dummyCommunities}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <PlaceholderCard title={item.title} />}
    />
  );
}
