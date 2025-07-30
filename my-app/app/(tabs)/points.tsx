import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import { router } from 'expo-router';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const windowHeight = Dimensions.get('window').height;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = toRad(lat1);
  const x2 = toRad(lat2);
  const x = toRad(lat2 - lat1);
  const y = toRad(lon2 - lon1);
  const a =
    Math.sin(x / 2) ** 2 +
    Math.cos(x1) * Math.cos(x2) * Math.sin(y / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PointsScreen() {
  const [storyStarted, setStoryStarted] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number>(50);

  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'script-loader',
    googleMapsApiKey: 'AIzaSyBjbQDjbaNPKzvwmJ3lfKYUGh2JXrVfg5s',
    libraries: ['places'],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('activeStory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setPoints(parsed.points ?? []);
        setQuestions(parsed.questions ?? []);
        setStoryStarted(true);
      }
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && 'geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setAccuracy(pos.coords.accuracy);
        },
        (err) => console.error('Geo error:', err),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
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

  const handleSelectAnswer = (questionKey: string, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionKey]: answerIndex }));
  };

  const markPointAsCompleted = async (point: any) => {
    try {
      await fetch('/api/complete-point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story_id: point.story_id, point_id: point.point_id }),
      });
      setPoints((prev) => prev.map((p) => p.point_id === point.point_id ? { ...p, completed: 1 } : p));
    } catch (err) {
      console.error('Errore aggiornamento punto:', err);
    }
  };

  const visiblePoints = (() => {
    if (!position) return [];
    const sorted = [...points].sort((a, b) => a.point_id - b.point_id);
    const nextPoint = sorted.find((p) => p.completed !== 1);
    if (!nextPoint) return [];
    const distance = getDistance(position.lat, position.lng, Number(nextPoint.latitude), Number(nextPoint.longitude));
    return distance <= 50 ? [nextPoint] : [];
  })();

  if (!isLoaded) {
    return (
      <View style={styles.centered}><Text>Loading map...</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={position || { lat: 0, lng: 0 }}
        zoom={17}
        onLoad={(map) => (mapRef.current = map)}
      />

      {!storyStarted && (
        <View style={styles.encouragementBox}>
          <Text style={styles.encouragementText}>
            Start your story to unlock your objectives!
          </Text>
        </View>
      )}

      <View style={styles.overlayContent}>
        <FlatList
          data={storyStarted ? visiblePoints : []}
          keyExtractor={(item, index) => (item?.point_id ?? index).toString()}
          renderItem={({ item }) => {
            const relatedQuestions = questions.filter(
              (q) => Number(q.point_id) === Number(item.point_id)
            );
            const isCompleted = item.completed === 1;

            return (
              <View style={styles.pointBox}>
                <View style={styles.pointHeader}>
                  <Text style={styles.pointTitle}>{item.name}</Text>
                  {isCompleted && <Ionicons name="checkmark-circle" size={24} color="#5D9C3F" />}
                </View>

                <Text style={styles.pointText}>{item.text}</Text>

                {relatedQuestions.map((q, idx) => {
                  const questionKey = `${item.point_id}-${idx}`;
                  return (
                    <View key={questionKey}>
                      <Text style={styles.question}>{q.question}</Text>
                      {[q.first_answer, q.second_answer, q.third_answer].map((a, i) => (
                        <Text
                          key={i}
                          style={[
                            styles.answerOption,
                            selectedAnswers[questionKey] === i + 1 && styles.selectedAnswer,
                          ]}
                          onPress={() => handleSelectAnswer(questionKey, i + 1)}
                        >
                          {String.fromCharCode(65 + i)}. {a}
                        </Text>
                      ))}
                    </View>
                  );
                })}

                {!isCompleted && (
                  <Text
                    style={styles.doneButton}
                    onPress={() => markPointAsCompleted(item)}
                  >
                    Done
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>
      <BottomNavbar
        state={storyStarted ? 'stop' : 'start'}
        onPress={() => router.push(storyStarted ? '/story' : '/time')}
      />


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlayContent: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  encouragementBox: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    zIndex: 10,
  },
  encouragementText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  pointBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderColor: '#D84171',
    borderWidth: 2,
  },
  pointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  pointText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    marginBottom: 6,
  },
  answerOption: {
    fontSize: 16,
    color: '#fff',
    backgroundColor: '#888',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    marginBottom: 10,
    marginLeft: 12,
    marginRight: 12,
  },
  selectedAnswer: {
    backgroundColor: '#D84171',
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#5D9C3F',
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    marginTop: 16,
    borderRadius: 20,
  },
});
