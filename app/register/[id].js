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
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/supabase-client';  // adjust path as needed

export default function TruckDetail() {
  const { id } = useLocalSearchParams();
  const [truck, setTruck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTruck = async () => {
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
    };

    loadTruck();
  }, [id]);

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
    <ScrollView contentContainerStyle={styles.container}>
      {truck.image_url ? (
        <Image
          source={{ uri: truck.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : null}

      <Text style={styles.name}>{truck.name}</Text>
      <Text style={styles.description}>{truck.description}</Text>
      {/* add more fields like menu, contact, etc. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 16 },
});
