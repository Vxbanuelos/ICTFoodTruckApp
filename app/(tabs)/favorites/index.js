// app/(tabs)/favorites/index.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchFavoriteTrucks } from '../../../src/favoritesService';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFavoriteTrucks();
        setFavorites(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Could not load favorites.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          You haven’t added any favorites yet!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favorites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/favorites/${item.id}`)}
        >
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.thumb} />
          ) : null}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text numberOfLines={2} style={styles.desc}>
              {item.description}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#555' },
  list: { padding: 16 },
  card: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  thumb: { width: 80, height: 80 },
  info: { flex: 1, padding: 8, justifyContent: 'center' },
  name: { fontSize: 18, fontWeight: 'bold' },
  desc: { fontSize: 14, color: '#666', marginTop: 4 },
});
