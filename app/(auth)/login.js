// app/(auth)/login.js
import React, { useState } from "react";
import {
  Pressable,
  Alert,
  StyleSheet,
  TextInput,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "../../src/supabase-client";
import { useRouter } from "expo-router";
import { Image } from "react-native";

// This is the login screen for a React Native app using Expo and Supabase.
// It allows users to sign in or sign up with email and password, and also provides a guest login option.
// The screen includes input fields for email and password, and buttons for signing in, signing up, and continuing as a guest.
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Save entire session object to AsyncStorage
  async function storeSessionData(session) {
    try {
      await AsyncStorage.setItem(
        "supabaseSession",
        JSON.stringify(session)
      );
    } catch (e) {
      console.warn("Failed to save session to AsyncStorage:", e);
    }
  }
// Load session from AsyncStorage
  async function signInWithEmail() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setLoading(true);
    const {
      data: { session },
      error: signInError,
    } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (signInError) {
      Alert.alert("Sign In Error", signInError.message);
      setLoading(false);
      return;
    }

    // Persist the session
    await storeSessionData(session);

    // Fetch their profile
    const userId = session.user.id;
    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      Alert.alert("Profile Error", profileError.message);
      setLoading(false);
      return;
    }

    // If no profile row yet → send them to setup
    if (!profileData) {
      router.replace("/profile/setup");
      setLoading(false);
      return;
    }
    //not working yet
    // If owner without a truck → send to add
    if (profileData.role === "owner") {
      const { data: truck, error: truckError } = await supabase
        .from("food_trucks")
        .select("id")
        .eq("owner_id", userId)
        .single();

      if (truckError) {
        Alert.alert("Truck Check Error", truckError.message);
        setLoading(false);
        return;
      }

      if (!truck) {
        router.replace("/register/new");
        setLoading(false);
        return;
      }
    }

    // Otherwise go to home
    router.replace("/home");
    setLoading(false);
  }

  async function signUpWithEmail() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Basic validation
    // Check if email and password are not empty
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (cleanPassword.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
      setLoading(false);
      return;
    }

    // Create a blank profile with default role
    // This is where you can set the default role for new users
    // For example, you can set it to "user" or "guest"
    const userId = data.user.id;
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        role: "username",
      });

    if (profileError) {
      console.warn("Failed to create profile:", profileError.message);
      Alert.alert("Profile Setup Error", "Failed to create a profile.");
    } else {
      Alert.alert("Registration Successful", "You are now signed up!");
    }
    setLoading(false);

    // Persist the session
    await storeSessionData(data.session);

    // Check if we need to prompt for setup
    const {
      data: profileData,
      error: profileErrorCheck,
    } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", userId)
      .maybeSingle();

    if (profileErrorCheck) {
      console.warn("Profile error:", profileErrorCheck.message);
      return;
    }

    if (!profileData.username || !profileData.avatar_url) {
      router.replace("/profile/setup");
    } else {
      router.replace("/home");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.screen}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/ICT.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.container}>
            <TextInput
              style={styles.textInput}
              onChangeText={setEmail}
              value={email}
              placeholder="email@address.com"
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={styles.textInput}
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              placeholder="Password"
              autoCapitalize="none"
              editable={!loading}
            />

            <Pressable
              disabled={loading}
              onPress={signInWithEmail}
              style={styles.buttonContainer}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>SIGN IN</Text>
              )}
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={signUpWithEmail}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>SIGN UP</Text>
            </Pressable>

            <Pressable
              disabled={loading}
              onPress={() => router.replace("/home")}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>CONTINUE AS GUEST</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// This is a simple login screen for a React Native app using Expo and Supabase.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -30,
  },
  logo: {
    width: 370,
    height: 370,
    resizeMode: "contain",
  },
  container: {
    width: "90%",
    padding: 16,
  },
  textInput: {
    width: "100%",
    borderColor: "#000968",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#f8f8f8",
  },
  buttonContainer: {
    backgroundColor: "#38b6ff",
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
