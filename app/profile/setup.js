import React, { useState, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase-client"; // Ensure correct import of supabase client
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store"; // Import SecureStore

export default function Setup() {
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Function to store session data in SecureStore
  const storeSessionData = async (token, userId) => {
    await SecureStore.setItemAsync("authToken", token); // Save auth token
    await SecureStore.setItemAsync("userId", userId);     // Save user ID
  };

  useEffect(() => {
    // Get current user from Supabase authentication
    const fetchUser = async () => {
      const { data: userSession, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error.message);
        router.replace("/login"); // Redirect to login if there's an error
      } else if (userSession) {
        setUser(userSession); // Set user if authenticated
      } else {
        router.replace("/login"); // Redirect to login if not authenticated
      }
    };

    fetchUser();
  }, []);

  // Handle form submission
  const handleSubmit = async () => {
    if (!username) {
      Alert.alert("Please enter a username.");
      return;
    }
    setUploading(true);
    try {
      // Update username in the Supabase profiles table
      const { error: updErr } = await supabase
        .from("profiles")
        .upsert({ username, id: user.id }) // Assuming 'id' is the correct column for user reference
        .eq("id", user.id); // Ensure 'id' matches the user.id

      if (updErr) {
        console.error('Profile update error:', updErr);
        throw updErr;
      }

      // Store session data in SecureStore after profile setup
      const session = supabase.auth.session();
      await storeSessionData(session?.access_token, user.id);

      router.replace("/(tabs)/home"); // Redirect to the home screen
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  // Loading state while waiting for user data
  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#38b6ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your profile</Text>

      {/* Username input */}
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        editable={!uploading}
      />

      {/* Submit button */}
      <Pressable onPress={handleSubmit} style={styles.button} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save & Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold" },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: "#38b6ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
