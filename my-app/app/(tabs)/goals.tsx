import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import BottomNavbar from '@/components/navigation/BottomNavbar';

export default function Goals() {
  // ✅ stato badge persistente
  const [storyState, setStoryState] = useState<'start' | 'stop' | 'continue'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('storyState');
      if (saved === 'start' || saved === 'stop' || saved === 'continue') return saved as any;
      const hasStory = !!sessionStorage.getItem('activeStory');
      return hasStory ? 'stop' : 'start';
    }
    return 'start';
  });

  // riallinea all’ingresso rispetto ad activeStory
  useEffect(() => {
    const stored = sessionStorage.getItem('activeStory');
    if (stored) {
      setStoryState(prev => (prev === 'start' ? 'stop' : prev));
    } else {
      setStoryState('start');
    }
  }, []);

  // sincronizza su storage a ogni cambio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('storyState', storyState);
    }
  }, [storyState]);

  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  const fetchGoalsFromAPI = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const res = await fetch(`http://127.0.0.1:5000/goals?user_id=${user.id}`);
      const data = await res.json();
      setGoals(data);
    } catch (error) {
      console.error('Errore nel caricamento dei goals:', error);
    } finally {
      setLoadingGoals(false);
    }
  }, []);

  useEffect(() => {
    fetchGoalsFromAPI();
  }, [fetchGoalsFromAPI]);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={require('@/assets/images/profilo.png')}
          style={styles.header}
          resizeMode="cover"
        >
          <Text style={styles.title}>Goals</Text>
        </ImageBackground>

        {/* Goals list */}
        <View style={styles.goalContainer}>
          <Text style={styles.goalTitle}>Your personal goals</Text>

          {loadingGoals ? (
            <ActivityIndicator size="large" color="#5D9C3F" style={{ marginTop: 20 }} />
          ) : goals.length === 0 ? (
            <Text style={styles.goalPlaceholder}>No goals available</Text>
          ) : (
            goals.map((goal: any) => (
              <View key={goal.goal_name} style={styles.goalCard}>
                <Text style={styles.goalCardText}>{goal.title}</Text>
                <Text style={styles.goalCardProgress}>
                  {goal.progress}/{goal.target}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ✅ Navbar coerente e persistente */}
      <BottomNavbar
        state={storyState}
        onPress={() => {
          if (storyState === 'start') {
            router.push('/time'); // inizia la storia
          } else {
            setStoryState(prev => (prev === 'stop' ? 'continue' : 'stop')); // toggle ⏸/▶
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    alignItems: 'center',
    paddingBottom: 150,
  },
  header: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    marginBottom: 32,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  goalContainer: {
    width: '90%',
    alignSelf: 'center',
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  goalPlaceholder: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5D9C3F',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  goalCardText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
  },
  goalCardProgress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1C',
  },
});
