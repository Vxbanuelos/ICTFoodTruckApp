// src/components/TruckDetail.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { supabase } from './supabase-client';
import { Ionicons } from '@expo/vector-icons';
import { insertFavorite, deleteFavorite, isFavorited } from './favoritesService';

export default function TruckDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const maptilerKey = Constants.expoConfig.extra.maptilerKey;

  // Load truck details
  useEffect(() => {
    async function loadTruck() {
      setLoading(true);
      if (!id) {
        Alert.alert('Error', 'No truck selected.');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('foodtrucks')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setTruck(data);
      } catch (err) {
        console.error('Error loading truck:', err);
        Alert.alert('Error loading truck', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTruck();
  }, [id]);

  // Check favorite status
  useEffect(() => {
    async function checkFavorite() {
      if (!truck) return;
      try {
        const fav = await isFavorited(truck.id);
        setIsFav(fav);
      } catch (err) {
        console.error('Error checking favorite:', err);
      }
    }
    checkFavorite();
  }, [truck]);

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!truck) return;
    try {
      if (isFav) {
        await deleteFavorite(truck.id);
        setIsFav(false);
      } else {
        await insertFavorite(truck.id);
        setIsFav(true);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!truck) {
    return (
      <View style={styles.center}>
        <Text>No truck found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back arrow to return */}
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </Pressable>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {truck.image_url && (
          <Image
            source={{ uri: truck.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.name}>{truck.name}</Text>
        <Text style={styles.description}>{truck.description}</Text>

        <Pressable onPress={toggleFavorite} style={styles.favButton}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={40}
            color={isFav ? '#38b6ff' : 'gray'}
          />
        </Pressable>
      </ScrollView>

      {truck.lat != null && truck.lng != null ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: truck.lat,
            longitude: truck.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          mapType="none"
        >
          <UrlTile
            urlTemplate={`https://api.maptiler.com/tiles/streets/{z}/{x}/{y}.png?key=${maptilerKey}`}
            maximumZ={19}
            flipY={false}
          />
          <Marker
            coordinate={{ latitude: truck.lat, longitude: truck.lng }}
            title={truck.name}
            pinColor="#38b6ff"
          />
        </MapView>
      ) : (
        <Text style={styles.noLocation}>Location not available</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { padding: 16 },
  scrollContent: { padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
  favButton: { alignItems: 'center', marginBottom: 16 },
  map: { width: '100%', height: 150 },
  noLocation: { textAlign: 'center', marginVertical: 16, color: '#777' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
