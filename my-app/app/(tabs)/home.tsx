import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text, ActivityIndicator } from 'react-native';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import LayoutWrapper from '@/components/LayoutWrapper';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import { router } from 'expo-router';

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function HomeWebMapScreen() {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(50); // valore iniziale fallback
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'script-loader',
    googleMapsApiKey: 'AIzaSyBjbQDjbaNPKzvwmJ3lfKYUGh2JXrVfg5s',
    libraries: ['places'],
  });

  // Tracking GPS continuo
  useEffect(() => {
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          console.log(`Lat: ${coords.lat}, Lng: ${coords.lng}, Accuracy: ${pos.coords.accuracy} m`
);


          setPosition(coords);
          setAccuracy(pos.coords.accuracy); // in metri
        },
        (err) => {
          console.error('Errore GPS:', err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Aggiorna marker e cerchio dinamicamente
  useEffect(() => {
    if (position && mapRef.current) {
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: 'white',
          },
        });
      } else {
        markerRef.current.setPosition(position);
      }

      if (!circleRef.current) {
        circleRef.current = new window.google.maps.Circle({
          strokeColor: '#4285F4',
          strokeOpacity: 0.5,
          strokeWeight: 1,
          fillColor: '#4285F4',
          fillOpacity: 0.2,
          map: mapRef.current,
          center: position,
          radius: accuracy, // Dinamico!
        });
      } else {
        circleRef.current.setCenter(position);
        circleRef.current.setRadius(accuracy);
      }

      mapRef.current.setCenter(position);
    }
  }, [position, accuracy]);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>La mappa è disponibile solo su web.</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5D9C3F" />
        <Text style={styles.message}>Caricamento mappa...</Text>
      </View>
    );
  }

  return (
    <LayoutWrapper>
      <View style={styles.fullscreen}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          zoom={16}
          center={position || { lat: 0, lng: 0 }}
          onLoad={(map) => (mapRef.current = map)}
          options={{
            disableDefaultUI: false,
          }}
        />
      </View>
      <BottomNavbar state="start" onPress={() => router.push('/time')} />
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
});
