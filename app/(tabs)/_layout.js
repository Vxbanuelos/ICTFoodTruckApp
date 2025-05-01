//app/(tabs)/_layout.js

import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";



export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarLabel: "Home",
          
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="truck"//change this to any icon you want
              color={color}
            />
          ),
        }}
      />

<Tabs.Screen
        name="map"
        options={{
          tabBarLabel: "Map",
          
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="map"
              color={color}
        />
          ),
        }}
      />

<Tabs.Screen
        name="favorites"
        options={{
          tabBarLabel: "Favorites",
          
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="heart"
              color={color}
            />
          ),
        }}
      />


      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          
          tabBarIcon: ({ color }) => (
            <FontAwesome
              size={28}
              style={{ marginBottom: -3 }}
              name="gear"
              color={color}
            />
          ),
        }}
      />
     
     


    </Tabs>
  );
}

