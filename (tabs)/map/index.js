//index.js
// app/(tabs)/map/index.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, Text } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import Constants from 'expo-constants';
import { fetchFoodTrucks } from '../../../src/truckService';

// pulled from app.config.js → expo.extra
const mapTilerKey = Constants.expoConfig.extra.mapTilerKey;
// use the “-v2” style name
const TILE_URL = 
  `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

export default function MapScreen() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchFoodTrucks();
        setTrucks(data);
      } catch (e) {
        console.error(e);
        Alert.alert('Error', 'Could not load food trucks.');
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

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude:  37.68889,
          longitude: -97.33611,
          latitudeDelta:  0.1,
          longitudeDelta: 0.1,
        }}
        // hide the default basemap so only your tiles render
        mapType="none"
      >
        <UrlTile
          urlTemplate={TILE_URL}
          maximumZ={19}
          tileSize={256}
          flipY={false}
        />

        {trucks.map(truck =>
          truck.lat && truck.lng ? (
            <Marker
              key={truck.id}
              coordinate={{ latitude: truck.lat, longitude: truck.lng }}
              title={truck.name}
              description={truck.description}
              pinColor="#38b6ff"
            />
          ) : null
        )}
      </MapView>

      <Text style={styles.attribution}>
        © MapTiler © OpenStreetMap contributors
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map:         { flex: 1 },
  attribution: {
    position:        'absolute',
    bottom:          4,
    right:           4,
    fontSize:        10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding:         2,
    borderRadius:    4,
  },
});
