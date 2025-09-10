// app/(tabs)/home/[id].js
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Constants from 'expo-constants';
import { supabase } from '../../src/supabase-client';
import {
  insertFavorite,
  deleteFavorite,
  isFavorited,
} from '../../src/favoritesService';
import { Ionicons } from '@expo/vector-icons';

export default function TruckDetail() {
  const navigation = useNavigation();
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

  // Set header title
  useEffect(() => {
    if (truck?.name) {
      navigation.setOptions({ title: truck.name });
    }
  }, [truck]);

  // Check favorite status
  useEffect(() => {
    async function checkFavorite() {
      if (!truck) return;
      try {
        const fav = await isFavorited(truck.id);
        setIsFav(fav);
      } catch (err) {
        console.error('Error checking fav:', err);
      }
    }
    checkFavorite();
  }, [truck]);

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
        <Text style={styles.emptyText}>Truck not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Card */}
        {truck.image_url && (
          <View style={styles.imageCard}>
            <Image source={{ uri: truck.image_url }} style={styles.image} />
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.name}>{truck.name}</Text>
            <Pressable onPress={toggleFavorite} style={styles.favInlineButton}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={28}
                color={isFav ? '#38b6ff' : '#777'}
              />
            </Pressable>
          </View>
          <Text style={styles.description}>{truck.description}</Text>
        </View>

        {/* Location Section */}
        <View style={styles.mapCard}>
          <Text style={styles.sectionTitle}>Location</Text>
          {truck.lat != null && truck.lng != null ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: truck.lat,
                longitude: truck.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              mapType={Platform.OS === 'ios' ? 'none' : 'standard'}
            >
              <UrlTile
                urlTemplate={`https://api.maptiler.com/tiles/streets/{z}/{x}/{y}.png?key=${maptilerKey}`}
                maximumZ={19}
                tileSize={256}
                shouldReplaceMapContent={true}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#777' },
  content: { padding: 16 },

  imageCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  image: { width: '100%', height: 200 },

  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: { fontSize: 22, fontWeight: '600', color: '#222' },
  favInlineButton: { padding: 4 },
  description: { fontSize: 15, lineHeight: 22, color: '#555' },

  mapCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  map: { width: '100%', height: 150, borderRadius: 8 },

  noLocation: { textAlign: 'center', color: '#777' },
});
