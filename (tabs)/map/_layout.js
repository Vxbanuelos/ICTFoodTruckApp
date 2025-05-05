// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
export default () => (
  <Tabs>
    <Tabs.Screen name="home" />
    <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: () => <Icon name="map" size={24} color="black" /> }} />
    <Tabs.Screen name="settings" />
  </Tabs>
);