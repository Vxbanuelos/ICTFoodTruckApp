// app/(tabs)/register/create.js
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { addFoodTruck } from '../../src/truckService';
import { supabase } from '../../src/supabase-client';

export default function NewFoodTruckScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // 1️⃣ Ask for gallery permissions on mount
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Please enable photo access in your settings.'
        );
      }
    })();
  }, []);

  // 2️⃣ Launch image picker
  const pickImage = async () => {
    const mediaTypes =
      ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        base64: false,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error('Error launching image picker:', e);
      Alert.alert('Error', 'Could not open image gallery.');
    }
  };

  // 3️⃣ Upload & save
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Truck name is required.');
      return;
    }
    setSaving(true);

    let publicUrl = '';
    if (imageUri) {
      setUploadingImage(true);
      try {
        // Read file as base64
        const b64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        // Convert to Uint8Array
        const buf = Buffer.from(b64, 'base64');
        const arr = new Uint8Array(buf.buffer);

        const fileName = `${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('foodtruck-images')
          .upload(fileName, arr, {
            contentType: 'image/jpeg',
            upsert: true,
          });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('foodtruck-images')
          .getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      } catch (err) {
        console.error('Image upload error:', err);
        Alert.alert('Image Upload Error', err.message);
        setUploadingImage(false);
        setSaving(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    try {
      await addFoodTruck({
        name: name.trim(),
        description: description.trim(),
        image_url: publicUrl,
        location: null,
      });
      router.replace('/home');
    } catch (err) {
      console.error('Error saving truck:', err);
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Add New Food Truck</Text>

      <Pressable
        style={styles.imagePicker}
        onPress={pickImage}
        disabled={uploadingImage || saving}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <Text style={styles.pickText}>Tap to select image</Text>
        )}
        {(uploadingImage || saving) && (
          <ActivityIndicator style={styles.overlay} />
        )}
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Truck Name"
        value={name}
        onChangeText={setName}
        editable={!saving && !uploadingImage}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        editable={!saving && !uploadingImage}
      />

      <Pressable
        style={[styles.button, (saving || uploadingImage) && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving || uploadingImage}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Save Truck</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  imagePicker: {
    width: '100%',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pickText: { color: '#777' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: {
    backgroundColor: '#38b6ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
