import React, { useEffect, useState } from 'react';
import { Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import LayoutWrapper from '@/components/LayoutWrapper';
import { router } from 'expo-router';


export default function HomeWebMapScreen() {
  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
            setLocationUrl(mapsUrl);
          },
          (err) => {
            setError('Impossibile ottenere la posizione.');
            console.error('Errore geolocalizzazione:', err);
          }
        );
      } else {
        setError('Geolocalizzazione non supportata dal browser.');
      }
    }
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>La mappa è disponibile solo su web.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  if (!locationUrl) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5D9C3F" />
        <Text style={styles.message}>Sto cercando la tua posizione...</Text>
      </View>
    );
  }

  return (
    <LayoutWrapper>
        <View style={styles.fullscreen}>
        <iframe
          src={locationUrl}
          width="100%"
          height="100%"
          loading="lazy"
          style={styles.iframe}
        ></iframe>
        </View>
      <BottomNavbar
        state="start"
        onPress={() => router.push('/time')}
      />
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
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
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
