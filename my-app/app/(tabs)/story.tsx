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

const containerStyle = { width: '100%', height: '100%' };

export default function StoryMapScreen() {
  // ---- TTS refs (NO utteranceRef) ----
  const synthRef = useRef<any>(null);
  const voiceRef = useRef<any>(null);
  const chunksRef = useRef<string[]>([]);
  const idxRef = useRef<number>(0);

  const storyStateRef = useRef<'stop' | 'continue'>('stop');
  const isAudioPlayingRef = useRef<boolean>(true);

  const { story, points, questions } = useLocalSearchParams();
  const [parsedStory, setParsedStory] = useState<any>(null);
  const [parsedPoints, setParsedPoints] = useState<any[]>([]);
  const [parsedQuestions, setParsedQuestions] = useState<any[]>([]);
  const router = useRouter();

  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(50);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  const [storyState, setStoryState] = useState<'stop' | 'continue'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('storyState');
      if (saved === 'stop' || saved === 'continue') return saved;
    }
    return 'stop';
  });
  storyStateRef.current = storyState;

  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  isAudioPlayingRef.current = isAudioPlaying;

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'script-loader',
    googleMapsApiKey: 'AIzaSyBjbQDjbaNPKzvwmJ3lfKYUGh2JXrVfg5s',
    libraries: ['places'],
  });

  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const pickVoice = () => {
        const voices = synthRef.current?.getVoices?.() || [];
        voiceRef.current =
          voices.find((v: any) => /en-US/i.test(v.lang)) ||
          voices.find((v: any) => /en-GB/i.test(v.lang)) ||
          voices.find((v: any) => String(v.lang).toLowerCase().startsWith('en')) ||
          voices[0] ||
          null;
      };

      pickVoice();
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }
    return () => {
      try { synthRef.current?.cancel(); } catch {}
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = null as any;
      }
    };
  }, []);

  // salva storyState
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('storyState', storyState);
    }
  }, [storyState]);

  // ripristina storyState
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('storyState');
      if (saved === 'stop' || saved === 'continue') setStoryState(saved);
    }
  }, []);

  // parsing storia
  useEffect(() => {
    if (story && points && questions) {
      const pStory = typeof story === 'string' ? JSON.parse(story) : story;
      const pPoints = typeof points === 'string' ? JSON.parse(points) : [];
      const pQuestions = typeof questions === 'string' ? JSON.parse(questions) : [];

      setParsedStory(pStory);
      setParsedPoints(pPoints);
      setParsedQuestions(pQuestions);

      const completeStory = { ...pStory, points: pPoints, questions: pQuestions };
      sessionStorage.setItem('activeStory', JSON.stringify(completeStory));

      const saved = sessionStorage.getItem('storyState');
      if (saved !== 'stop' && saved !== 'continue') setStoryState('stop');
    } else {
      const stored = sessionStorage.getItem('activeStory');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setParsedStory(parsed);
          setParsedPoints(parsed.points ?? []);
          setParsedQuestions(parsed.questions ?? []);

          const saved = sessionStorage.getItem('storyState');
          if (saved !== 'stop' && saved !== 'continue') setStoryState('stop');
        } catch (err) {
          console.error('Errore nel parsing di activeStory:', err);
        }
      } else {
        console.warn('activeStory non trovato nel sessionStorage');
      }
    }
  }, [story, points, questions]);

// build chunks
useEffect(() => {
  if (!parsedStory) return;

  const combined = combineTitleIntroTheme(parsedStory);
  chunksRef.current = splitIntoChunks(combined);
  idxRef.current = 0;
}, [parsedStory]);

function combineTitleIntroTheme(s: any) {
  const parts = [s?.title, s?.intro, s?.theme]
    .map(v => (v ?? '').toString().trim())
    .filter(Boolean);
  return parts.join(' ');
}


  function splitIntoChunks(text: string) {
    if (!text) return [];
    const sentences = text.split(/(?<=[.!?])\s+/); // split per frase
    const MAX = 260;
    const packed: string[] = [];
    for (const s of sentences) {
      if (!s) continue;
      if (!packed.length) packed.push(s);
      else {
        const last = packed[packed.length - 1];
        if ((last + ' ' + s).length <= MAX) packed[packed.length - 1] = last + ' ' + s;
        else packed.push(s);
      }
    }
    return packed;
  }

  // parla un chunk all'indice i, con volume opzionale
  function speakChunkAt(i: number, forceVolume?: number) {
    const synth = synthRef.current;
    const chunks = chunksRef.current;
    if (!synth || !chunks?.length) return;
    if (i < 0 || i >= chunks.length) return;

    // stoppa quello in corso e riparti dal chunk corrente (non la storia intera)
    synth.cancel();

    const u = new SpeechSynthesisUtterance(chunks[i]);
    u.lang = 'en-GB'; // o 'en-GB'
    u.rate = 1;
    u.pitch = 1;
    u.volume = typeof forceVolume === 'number' ? forceVolume : (isAudioPlayingRef.current ? 1 : 0);
    if (voiceRef.current) u.voice = voiceRef.current;

    u.onend = () => {
      if (storyStateRef.current === 'continue') {
        idxRef.current = i + 1;
        if (idxRef.current < chunks.length) speakChunkAt(idxRef.current);
      }
    };

    synth.speak(u);
  }

  // navbar stop/continue
  useEffect(() => {
    const synth = synthRef.current;
    if (!synth) return;

    if (storyState === 'continue') {
      // se non sta parlando, inizia dal chunk corrente
      if (!synth.speaking && chunksRef.current.length) {
        speakChunkAt(idxRef.current);
      } else if (synth.paused) {
        synth.resume();
      }
    } else {
      if (synth.speaking && !synth.paused) synth.pause(); // pausa, mantiene l'indice
    }
  }, [storyState]);

  const handleMute = () => {
    setIsAudioPlaying(false);
    // pausa (conserva posizione esatta)
    if (synthRef.current?.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
    }
  };

  const handleUnmute = () => {
    setIsAudioPlaying(true);
    // se sei in "continue" riprendi dal punto esatto
    if (storyState === 'continue' && synthRef.current?.paused) {
      synthRef.current.resume();
    }
  };


  const handleStoryStateToggle = () => {
    const next = storyState === 'stop' ? 'continue' : 'stop';
    // legato al gesto utente per avviare TTS
    if (next === 'continue') {
      if (synthRef.current?.paused) synthRef.current.resume();
      else if (!synthRef.current?.speaking && chunksRef.current.length) {
        speakChunkAt(idxRef.current);
      }
    } else {
      if (synthRef.current?.speaking && !synthRef.current.paused) synthRef.current.pause();
    }
    setStoryState(next);
  };

  const stopTTS = () => {
    try { synthRef.current?.cancel(); } catch {}
  };


  const handleStoryCompletion = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      const storyId = parsedStory?.id;
      if (!storyId || !userId) return;

      await fetch('http://127.0.0.1:5000/complete-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, story_id: storyId }),
      });
    } catch (error) {
      console.error('Errore durante la POST:', error);
    }
  };

  const updateGoalProgress = async (goalName: string, progress: number, completed = false) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await fetch(`http://127.0.0.1:5000/goals/${goalName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, progress, completed }),
      });
    } catch (err) {
      console.error('Errore aggiornamento goal:', err);
    }
  };

  const handleExit = async () => {
    await handleStoryCompletion();

    if (parsedStory) {
      const km = parsedStory.km || 0;
      const duration = parsedStory.duration || 0;
      const steps = parsedStory.steps || 0;

      await updateGoalProgress('first_story', 1, true);
      await updateGoalProgress('walk_5km', km, km >= 5);
      await updateGoalProgress('monthly_steps_20000', steps, false);
      if (duration >= 60) await updateGoalProgress('long_story_60min', duration, true);
    }

    stopTTS();
    sessionStorage.removeItem('activeStory');
    sessionStorage.removeItem('storyState');
    router.push('/home');
  };

  // geoloc
  useEffect(() => {
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(coords);
          setAccuracy(pos.coords.accuracy);
        },
        () => setError('Unable to retrieve location.'),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      setError('Geolocation not supported by the browser.');
    }
  }, []);

  // marker cerchio
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
        options={{ disableDefaultUI: false }}
      />

      {/* storia */}
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
          </ScrollView>
        )}

        <View style={styles.topControls}>
          <Pressable
            onPress={handleUnmute}
            style={[styles.audioButton, isAudioPlaying && styles.active]}
          >
            <Ionicons name="volume-high" size={20} color={isAudioPlaying ? 'white' : '#666'} />
          </Pressable>

          <Pressable
            onPress={handleMute}
            style={[styles.audioButton, !isAudioPlaying && styles.active]}
          >
            <Ionicons name="volume-mute" size={20} color={!isAudioPlaying ? 'white' : '#666'} />
          </Pressable>

          <Pressable onPress={handleExit} style={styles.endButton}>
            <Text style={styles.endText}>End Story</Text>
          </Pressable>
        </View>
      </View>

      <BottomNavbar state={storyState} onPress={handleStoryStateToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: { flex: 1, position: 'relative', width: '100%', height: '100%' },
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
  toggle: { position: 'absolute', top: 8, left: 8, zIndex: 20 },
  scrollContent: { marginTop: 36, paddingHorizontal: 20, paddingBottom: 30 },
  header: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  title: {
    fontSize: 23,
    color: '#D84171',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  intro: { fontSize: 18, textAlign: 'center', color: '#444', marginBottom: 10 },
  theme: { fontSize: 18, textAlign: 'center', color: '#222' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { fontSize: 16, textAlign: 'center', paddingHorizontal: 20, marginTop: 10 },
  topControls: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
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
  active: { backgroundColor: '#D84171' },
  endButton: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: '#D84171',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
});
