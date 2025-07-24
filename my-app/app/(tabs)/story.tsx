import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '@/components/navigation/BottomNavbar';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

export default function StoryMapScreen() {
  const { story } = useLocalSearchParams();
  const parsedStory = typeof story === 'string' ? JSON.parse(story) : story;

  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [storyState, setStoryState] = useState<'stop' | 'continue'>('stop');

  const handleStoryStateToggle = () => {
    setStoryState((prev) => (prev === 'stop' ? 'continue' : 'stop'));
  };


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
            setError('Unable to retrieve location.');
            console.error('Geolocation error:', err);
          }
        );
      } else {
        setError('Geolocation not supported by the browser.');
      }
    }
  }, []);

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Map is only available on web.</Text>
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
        <Text style={styles.message}>Fetching your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullscreen}>
      <iframe src={locationUrl} style={styles.iframe} loading="lazy"></iframe>

      <View
        style={[
          styles.overlay,
          {
            height: expanded ? windowHeight * 0.5 : 50,
          },
        ]}
      >
        <Pressable style={styles.toggle} onPress={() => setExpanded((prev) => !prev)}>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#333"
          />
        </Pressable>

        {expanded && (
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.header}>Here is your story!</Text>
            <Text style={styles.title}>{parsedStory.title}</Text>
            <Text style={styles.intro}>{parsedStory.intro}</Text>
            <Text style={styles.theme}>
            <Text style={styles.theme}>{parsedStory.theme}</Text>
            </Text>
          </ScrollView>
        )}
      </View>
      <BottomNavbar
        state={storyState}
        onPress={handleStoryStateToggle}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
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
  overlay: {
    position: 'absolute',
    top: 30,
    left: '50%',
    transform: [{ translateX: -windowWidth * 0.4 }],
    width: windowWidth * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  toggle: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 20,
  },
  scrollContent: {
    marginTop: 36,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    color: '#D84171',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 10,
  },
  theme: {
    fontSize: 16,
    textAlign: 'center',
    color: '#222',
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
