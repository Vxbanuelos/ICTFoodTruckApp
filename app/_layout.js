
// app/_layout.js
import React from 'react'
import { Stack } from 'expo-router'

import 'react-native-url-polyfill/auto'
import 'react-native-get-random-values'


export default function RootLayout() {
  // THIS Stack wraps *every* screen under /app
  // headerShown:false kills the top bar everywhere
  return <Stack screenOptions={{ headerShown: false }} />
}
