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
const { story, points, questions } = useLocalSearchParams();

const [parsedStory, setParsedStory] = useState<any>(null);
const [parsedPoints, setParsedPoints] = useState<any[]>([]);
const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);

useEffect(() => {
  if (story && points && questions) {
    // Se arrivano da URL
    setParsedStory(typeof story === 'string' ? JSON.parse(story) : story);
    setParsedPoints(typeof points === 'string' ? JSON.parse(points) : []);
    setParsedQuestions(typeof questions === 'string' ? JSON.parse(questions) : []);
  } else {
    // Fallback a sessionStorage
    const stored = sessionStorage.getItem('activeStory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setParsedStory(parsed.story ?? null);
        setParsedPoints(parsed.points ?? []);
        setParsedQuestions(parsed.questions ?? []);
      } catch (err) {
        console.error('Errore nel parsing della storia:', err);
      }
    }
  }
}, [story, points, questions]);


  const [locationUrl, setLocationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [storyState, setStoryState] = useState<'stop' | 'continue'>('stop');
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);

  const toggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };


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

        <View style={styles.audioControls}>
        <Pressable onPress={toggleAudio} style={[styles.audioButton, isAudioPlaying && styles.active]}>
          <Ionicons name="volume-high" size={20} color={isAudioPlaying ? 'white' : '#666'} />
        </Pressable>
        <Pressable onPress={toggleAudio} style={[styles.audioButton, !isAudioPlaying && styles.active]}>
          <Ionicons name="volume-mute" size={20} color={!isAudioPlaying ? 'white' : '#666'} />
        </Pressable>
      </View>

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
  audioControls: {
  position: 'absolute',
  top: 6,
  right: 6,
  flexDirection: 'row',
  gap: 8,
  zIndex: 20,
},
audioButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#eee',
  justifyContent: 'center',
  alignItems: 'center',
},
active: {
  backgroundColor: '#D84171',
},

});
