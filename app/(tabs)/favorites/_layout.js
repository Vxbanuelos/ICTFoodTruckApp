// app/(tabs)/favorites/_layout.js
import React from 'react'
import { Stack } from 'expo-router'

export default function FavoritesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  )
}
