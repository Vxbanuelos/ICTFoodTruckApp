//auth/login.j
import React, { useState } from "react";
import { Pressable,Alert, StyleSheet, TextInput, View, Text } from "react-native";
import { supabase } from "../lib/supabase-client";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";

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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: "ICT Streets" }} />
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          style={styles.textInput}
          label="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          style={styles.textInput}
          label="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={"none"}
        />
      </View>
 
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Pressable
          disabled={loading}
          onPress={() => signInWithEmail()}
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>SIGN IN</Text>
        </Pressable>
      </View>

      
      <View style={styles.verticallySpaced}>
        <Pressable
          disabled={loading}
          onPress={() => signUpWithEmail()}
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>SIGN UP</Text>
        </Pressable>
        </View>

      
     <View style={styles.verticallySpaced}>
        <Pressable
          disabled={loading}
          onPress={() => {
            
            router.replace("/(tabs)/home");
          }} 
          style={styles.buttonContainer}
        >
          <Text style={styles.buttonText}>CONTINUE AS GUEST</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 300,
    padding: 12,
  
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 5,
  },
  buttonContainer: {
    backgroundColor: "#20b2aa",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 8,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  textInput: {
    borderColor: "#000968",
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    padding: 12,
    margin: 8,
  },
});