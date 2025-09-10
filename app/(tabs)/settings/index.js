// app/(tabs)/settings/index.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../../src/supabase-client";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  // Function to load the user's profile
  // This function fetches the user's profile from the database and sets it in the state.
  async function loadProfile() {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return router.replace("/login");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    if (profileError) {
      Alert.alert("Error", "Could not load profile.");
    } else if (!profileData || !profileData.username) {
      router.replace("/profile/setup");
    } else {
      setProfile({ id: user.id, ...profileData });
      setNewUsername(profileData.username);
    }
    setLoading(false);
  }
// Function to handle sign out
  // This function is called when the user clicks the sign out button.
  async function handleSignOut() {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error", "Could not sign out.");
      setLoading(false);
      return;
    }
    await AsyncStorage.removeItem("supabaseSession");
    router.replace("/login");
  }
// Function to handle image picking
  // This function is called when the user clicks the avatar image to change it.
  async function handlePickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return Alert.alert("Permission denied", "Need photo permissions to update avatar.");
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.cancelled) return;

    try {
      setUploading(true);
      const uri = result.uri;
      const response = await fetch(uri);
      const blob = await response.blob();
      const ext = uri.split('.').pop();
      const fileName = `${profile.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) {
      Alert.alert("Error updating avatar", err.message);
    } finally {
      setUploading(false);
    }
  }
// Function to handle username save
  // This function is called when the user clicks the save button after editing their username.
  async function handleSaveUsername() {
    if (!newUsername.trim()) return Alert.alert("Invalid username", "Cannot be empty.");
    setUploading(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', profile.id);
      if (updateError) throw updateError;
      setProfile(prev => ({ ...prev, username: newUsername.trim() }));
      setEditing(false);
      Alert.alert("Success", "Username updated.");
    } catch (err) {
      Alert.alert("Error updating username", err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
// If the profile is not loaded, show a placeholder
  return (
    <View style={styles.container}>
      <Pressable onPress={handlePickImage} disabled={uploading} style={styles.avatarContainer}>
        <Image
          source={{ uri: profile.avatar_url || 'https://via.placeholder.com/120' }}
          style={styles.avatar}
        />
        <MaterialIcons name="edit" size={24} style={styles.avatarEditIcon} />
        {uploading && <ActivityIndicator style={styles.uploadOverlay} />}
      </Pressable>

      {editing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            editable={!uploading}
          />
          <Pressable
            style={[styles.saveButton, uploading && { opacity: 0.6 }]}
            onPress={handleSaveUsername}
            disabled={uploading}
          >
            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save</Text>}
          </Pressable>
          <Pressable onPress={() => { setEditing(false); setNewUsername(profile.username); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.username}>{profile.username}</Text>
          <Pressable onPress={() => setEditing(true)} style={styles.nameEditIcon}>
            <MaterialIcons name="edit" size={20} color="#38b6ff" />
          </Pressable>
        </View>
      )}

      <Pressable style={styles.signOutButton} onPress={handleSignOut} disabled={loading}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  avatarEditIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  nameEditIcon: {
    marginLeft: 8,
  },
  editContainer: {
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    alignItems: "center",
  },
  editText: {
    color: '#38b6ff',
    marginTop: 8,
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#38b6ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelText: {
    color: '#888',
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: '#38b6ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});