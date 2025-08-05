import React, { useEffect, useState, useRef } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import BottomNavbar from '@/components/navigation/BottomNavbar';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function StoryMapScreen() {
  const { story, points, questions } = useLocalSearchParams();
  const [parsedStory, setParsedStory] = useState<any>(null);
  const [parsedPoints, setParsedPoints] = useState<any[]>([]);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const router = useRouter();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [storyState, setStoryState] = useState<'stop' | 'continue'>('stop');
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'script-loader',
    googleMapsApiKey: 'AIzaSyBjbQDjbaNPKzvwmJ3lfKYUGh2JXrVfg5s',
    libraries: ['places'],
  });

  useEffect(() => {
    if (story && points && questions) {
      const parsedStory = typeof story === 'string' ? JSON.parse(story) : story;
      const parsedPoints = typeof points === 'string' ? JSON.parse(points) : [];
      const parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : [];

      setParsedStory(parsedStory);
      setParsedPoints(parsedPoints);
      setParsedQuestions(parsedQuestions);

      const completeStory = {
        ...parsedStory,
        points: parsedPoints,
        questions: parsedQuestions,
      };
      sessionStorage.setItem('activeStory', JSON.stringify(completeStory));
    } else {
      const stored = sessionStorage.getItem('activeStory');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setParsedStory(parsed);
          setParsedPoints(parsed.points ?? []);
          setParsedQuestions(parsed.questions ?? []);
        } catch (err) {
          console.error('Errore nel parsing di activeStory:', err);
        }
      } else {
        console.warn('activeStory non trovato nel sessionStorage');
      }
    }
  }, [story, points, questions]);

  const toggleAudio = () => {
    setIsAudioPlaying((prev) => !prev);
  };

  const handleStoryStateToggle = () => {
    setStoryState((prev) => (prev === 'stop' ? 'continue' : 'stop'));
  };




  const handleStoryCompletion = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const storyId = parsedStory?.id;

    if (!storyId || !userId) {
      console.warn('Missing storyId or userId');
      return;
    }

    const response = await fetch('http://127.0.0.1:5000/complete-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        story_id: storyId,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ Storia registrata come completata');
    } else {
      console.warn('⚠️ Errore nella registrazione:', result.message);
    }
  } catch (error) {
    console.error('❌ Errore durante la POST:', error);
  }
};

const updateGoalProgress = async (goalName: string, progress: number, completed = false) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await fetch(`http://127.0.0.1:5000/goals/${goalName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        progress,
        completed,
      }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      console.log(`🎯 Goal "${goalName}" aggiornato`);
    } else {
      console.warn(`⚠️ Errore aggiornando il goal ${goalName}:`, result.message);
    }
  } catch (err) {
    console.error('❌ Errore aggiornamento goal:', err);
  }
};

const handleExit = async () => {
  await handleStoryCompletion(); // registra la storia completata

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  if (parsedStory && userId) {
    const km = parsedStory.km || 0;
    const duration = parsedStory.duration || 0;
    const steps = parsedStory.steps || 0;

    await updateGoalProgress('first_story', 1, true);
    await updateGoalProgress('walk_5km', km, km >= 5);
    await updateGoalProgress('monthly_steps_20000', steps, false);
    if (duration >= 60) {
      await updateGoalProgress('long_story_60min', duration, true);
    }
  }

  sessionStorage.removeItem('activeStory');
  router.push('/home');
};



  useEffect(() => {
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setPosition(coords);
          setAccuracy(pos.coords.accuracy);
          console.log(`📍 Lat: ${coords.lat}, Lng: ${coords.lng}, Accuracy: ${pos.coords.accuracy} m`);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to retrieve location.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation not supported by the browser.');
    }
  }, []);

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
          radius: accuracy,
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
        <Text style={styles.message}>Map is only available on web.</Text>
      </View>
    );
  }

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5D9C3F" />
        <Text style={styles.message}>Loading map...</Text>
      </View>
    );
  }

  return (
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

      {/* Overlay con storia */}
      <View style={[styles.overlay, { height: expanded ? windowHeight * 0.3 : 50 }]}>
        <Pressable style={styles.toggle} onPress={() => setExpanded((prev) => !prev)}>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
        </Pressable>

        {expanded && (
          <ScrollView style={styles.scrollContent}>
            <Text style={styles.header}>Here is your story!</Text>
            <Text style={styles.title}>{parsedStory?.title}</Text>
            <Text style={styles.intro}>{parsedStory?.intro}</Text>
            <Text style={styles.theme}>{parsedStory?.theme}</Text>
            <Pressable
              onPress={handleExit}
              style={[styles.exitButton, { top: expanded ? windowHeight * 0.3 + 80 : 80 }]}
            >
              <Text style={styles.exitText}>Finish</Text>
            </Pressable>
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

      

      <BottomNavbar state={storyState} onPress={handleStoryStateToggle} />
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
    paddingBottom: 30,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 23,
    color: '#D84171',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  intro: {
    fontSize: 18,
    textAlign: 'center',
    color: '#444',
    marginBottom: 10,
  },
  theme: {
    fontSize: 18,
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
  exitButton: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: 60 }],
    backgroundColor: '#D84171',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 15,
    zIndex: 15,
  },
  exitText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
