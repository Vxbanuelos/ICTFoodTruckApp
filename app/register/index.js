// app/(tabs)/register/index.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
// Import fetchFoodTrucks from the co-located truckService.js
import { fetchFoodTrucks } from '../../src/truckService';

export default function TruckRegisterScreen() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodTrucks()
      .then((data) => setTrucks(data))
      .catch((err) => console.error('Error fetching trucks:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (trucks.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No food trucks available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Trucks</Text>
      <FlatList
        data={trucks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 12 },
  item: { fontSize: 18, marginBottom: 8 },
});