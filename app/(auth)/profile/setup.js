// app/(auth)/profile/setup.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import { supabase } from "../../../src/supabase-client";
import { useRouter } from "expo-router";

// This is the setup screen for the user profile
// It allows the user to set their username after signing in
export default function Setup() {
  const [username, setUsername] = useState("");
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();
      if (error || !user) {
        console.error("Auth error:", error);
        return router.replace("/login");
      }
      setUser(user);
    }
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (!username.trim()) {
      return Alert.alert("Please enter a username.");
    }
    setUploading(true);

    console.log("saving profile...", user.id, username);

    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, username: username.trim() }, { onConflict: "id" });
      if (profileError) throw profileError;

      router.replace("/home");
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set up your profile</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
        editable={!uploading}
      />
      <Pressable
        onPress={handleSubmit}
        style={[styles.button, uploading && { opacity: 0.6 }]}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save & Continue</Text>
        )}
      </Pressable>
    </View>
  );
}
//styles for the Setup component

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold"
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: '#f8f8f8'
  },
  button: {
    marginTop: 30,
    backgroundColor: "#38b6ff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: "100%",
    alignItems: 'center'
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
});
