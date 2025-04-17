//auth/login.js
// This file handles the authentication logic for signing in and signing up users
// It uses Supabase for authentication and Expo Router for navigation
import React, { useState } from "react";
import { Pressable,Alert, StyleSheet, TextInput, View, Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { supabase } from "../lib/supabase-client";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import {Image} from "react-native";


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign In Error", error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign Up Error", error.message);
    setLoading(false);
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
            
      
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
      
            <View style={styles.verticallySpaced}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="Password"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
      
            <View style={[styles.verticallySpaced, styles.mt20]}>
              <Pressable
                disabled={loading}
                onPress={signInWithEmail}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>SIGN IN</Text>
              </Pressable>
            </View>
      
            <View style={styles.verticallySpaced}>
              <Pressable
                disabled={loading}
                onPress={signUpWithEmail}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>SIGN UP</Text>
              </Pressable>
            </View>
      
            <View style={styles.verticallySpaced}>
              <Pressable
                disabled={loading}
                onPress={() => router.replace("/(tabs)/home")}
                style={styles.buttonContainer}
              >
                <Text style={styles.buttonText}>CONTINUE AS GUEST</Text>
              </Pressable>
            </View>
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
      paddingTop:5,
      width: "90%", // allow inputs inside to stretch
      paddingHorizontal: 16,
      backgroundColor: "#fff",
    },
  
    textInput: {
      width: "100%", // full width of container
      borderColor: "#000968",
      borderRadius: 10,
      borderWidth: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      backgroundColor: "#f8f8f8",
    },
  
    verticallySpaced: {
      marginVertical: 8,
    },
  
    mt20: {
      marginTop: 1,
    },
  
    buttonContainer: {
      backgroundColor: "#38b6ff",
      borderRadius: 10,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginVertical: 3,
      width: "100%",
    },
  
    buttonText: {
      fontSize: 18,
      color: "#fff",
      fontWeight: "bold",
      textAlign: "center",
      textTransform: "uppercase",
    },
  });
  