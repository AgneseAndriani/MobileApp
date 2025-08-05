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
  const [storyState, setStoryState] = useState<'stop' | 'continue' | 'none'>('none');
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('activeStory');
    if (stored) {
      setStoryState('continue');
    } else {
      setStoryState('none');
    }
  }, []);

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

      {/* Dynamic Bottom Navbar */}
      {storyState === 'none' ? (
        <BottomNavbar state="start" onPress={() => router.push('/time')} />
      ) : (
        <BottomNavbar
          state={storyState}
          onPress={() =>
            setStoryState((prev) => (prev === 'stop' ? 'continue' : 'stop'))
          }
        />
      )}
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
  goalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#5D9C3F',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
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
  goalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  goalProgress: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
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
