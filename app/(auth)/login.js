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
import * as SecureStore from "expo-secure-store"; // Import SecureStore
import { supabase } from "../lib/supabase-client";
import { useRouter } from "expo-router";
import { Image } from "react-native";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Store token and user data in SecureStore
  const storeSessionData = async (token, userId) => {
    await SecureStore.setItemAsync("authToken", token); // Save auth token
    await SecureStore.setItemAsync("userId", userId);     // Save user ID
  };

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

    // Store session data in SecureStore
    await storeSessionData(session.access_token, session.user.id);

    // fetch their profile
    const userId = session.user.id;
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", userId)
      .single();

    if (profileError) {
      Alert.alert("Profile Error", profileError.message);
      setLoading(false);
      return;
    }

    // 1) Profile setup?
    if (!profileData.username || !profileData.avatar_url) {
      router.replace("/profile/setup");  // Redirect to profile setup if profile is incomplete
      setLoading(false);
      return;
    }

    // 2) If owner, check for truck
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
        router.replace("/register/truck");
        setLoading(false);
        return;
      }
    }

    // 3) Otherwise go to home
    router.replace("/(tabs)/home");
    setLoading(false);
  }

  async function signUpWithEmail() {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Basic email format check
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
      options: {
        // Ensure the user is logged in immediately and bypasses email confirmation
        emailRedirectTo: "exp://127.0.0.1:19000", // Adjust this for your platform
        shouldConfirm: false,
      },
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
      setLoading(false);
      return;
    }

    // Insert a blank profile with default role = "user"
    const userId = data.user.id;
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: userId,
      role: "user",
    });

    if (profileError) {
      console.warn("Failed to create profile:", profileError.message);
      Alert.alert("Profile Setup Error", "Failed to create a profile.");
    } else {
      Alert.alert("Registration Successful", "You are now signed up and logged in.");
    }
    setLoading(false);

    // Store session data in SecureStore
    await storeSessionData(data.session.access_token, userId);

    // Redirect user to profile setup or home
    const { data: profileData, error: profileErrorCheck } = await supabase
      .from("profiles")
      .select("username, avatar_url, role")
      .eq("id", userId)
      .single();

    if (profileErrorCheck) {
      console.warn("Profile error:", profileErrorCheck.message);
      return;
    }

    if (!profileData.username || !profileData.avatar_url) {
      router.replace("/profile/setup");  // If profile isn't set up, prompt for profile setup
    } else {
      router.replace("/(tabs)/home");  // Otherwise, redirect to the home page
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
              onPress={() => router.replace("/(tabs)/home")}
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
