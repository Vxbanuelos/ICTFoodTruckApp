// app/(tabs)/favorites/_layout.js
import React from 'react';
import { Stack } from 'expo-router';

export default function FavoritesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />

      {/* allow navigating to /home/[id] from inside this stack */}
      <Stack.Screen name="../home/[id]" />
    </Stack>
  );
}
