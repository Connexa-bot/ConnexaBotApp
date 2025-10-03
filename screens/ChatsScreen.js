import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";

export default function ChatsScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000); // simulate API
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <SkeletonPlaceholder>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonPlaceholder.Item
              key={i}
              flexDirection="row"
              alignItems="center"
              marginBottom={20}
            >
              <SkeletonPlaceholder.Item width={50} height={50} borderRadius={25} />
              <SkeletonPlaceholder.Item marginLeft={10}>
                <SkeletonPlaceholder.Item width={120} height={20} borderRadius={4} />
                <SkeletonPlaceholder.Item
                  marginTop={6}
                  width={180}
                  height={20}
                  borderRadius={4}
                />
              </SkeletonPlaceholder.Item>
            </SkeletonPlaceholder.Item>
          ))}
        </SkeletonPlaceholder>
      </ScrollView>
    );
  }

  // Empty state when no chats yet
  return <ScrollView style={{ flex: 1, padding: 16 }} />;
}
