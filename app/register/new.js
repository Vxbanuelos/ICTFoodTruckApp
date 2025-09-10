// app/(tabs)/register/new.js
// This file is the screen for adding a new food truck. It allows users to pick an image, enter truck details, and save the truck to the database.
// It uses the Expo ImagePicker for selecting images, and the Expo Location API for getting the user's location.
// The image is uploaded to Supabase storage, and the truck details are saved in a PostgreSQL database using Supabase.
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
import * as Location from 'expo-location';
import { Buffer } from 'buffer';
import { addFoodTruck } from '../../src/truckService';
import { supabase } from '../../src/supabase-client';

export default function NewFoodTruckScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [imageUri, setImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Enable photo access in settings.');
      }
    })();
  }, []);

  // Pick image
  const pickImage = async () => {
    const mediaTypes =
      ImagePicker.MediaType?.Images ?? ImagePicker.MediaTypeOptions.Images;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not open image gallery.');
    }
  };

  // Get current GPS location
  const useMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Cannot get your location.');
      return;
    }
    const { coords: c } = await Location.getCurrentPositionAsync();
    setCoords({ latitude: c.latitude, longitude: c.longitude });
    Alert.alert(
      'Location set',
      `Lat: ${c.latitude.toFixed(4)}, Lng: ${c.longitude.toFixed(4)}`
    );
  };

  // Geocode the entered address
  const resolveAddress = async () => {
    if (!address.trim()) {
      Alert.alert('Enter an address first');
      return;
    }
    try {
      const resp = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(
          address
        )}.json?key=${process.env.MAPTILER_KEY}`
      );
      const { features } = await resp.json();
      if (features.length) {
        const [lng, lat] = features[0].geometry.coordinates;
        setCoords({ latitude: lat, longitude: lng });
        Alert.alert(
          'Address resolved',
          `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`
        );
      } else {
        Alert.alert('Not found', 'Could not resolve that address.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to geocode address.');
    }
  };

  // Save truck
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Truck name is required.');
      return;
    }
    if (!coords.latitude) {
      Alert.alert('Location required', 'Please set or resolve a location first.');
      return;
    }
    setSaving(true);

    let publicUrl = '';
    if (imageUri) {
      setUploadingImage(true);
      try {
        const b64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
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
        console.error(err);
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
        lat: coords.latitude,
        lng: coords.longitude,
      });
      router.replace('/home');
    } catch (err) {
      console.error(err);
      Alert.alert('Error saving truck', err.message);
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

      <View style={styles.locationContainer}>
        <Pressable style={styles.locationButton} onPress={useMyLocation}>
          <Text style={styles.locationButtonText}>
            {coords.latitude
              ? `My Location: (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`
              : 'Use My Location'}
          </Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Enter address (address, city, state)"
          value={address}
          onChangeText={setAddress}
          editable={!saving}
        />
        <Pressable style={styles.resolveButton} onPress={resolveAddress}>
          <Text style={styles.locationButtonText}>Verify Address</Text>
        </Pressable>
      </View>

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
//styles for the NewFoodTruckScreen component
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
  locationContainer: {
    marginBottom: 16,
  },
  locationButton: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resolveButton: {
    backgroundColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  locationButtonText: {
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#38b6ff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
