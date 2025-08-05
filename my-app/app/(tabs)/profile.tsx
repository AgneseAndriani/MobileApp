import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import { router } from 'expo-router';


const screenWidth = Dimensions.get('window').width;
const DAYS_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProfileStatistics() {
  const [weeklyStats, setWeeklyStats] = useState({
    km: Array(7).fill(0),
    steps: Array(7).fill(0),
    calories: Array(7).fill(0),
    labels: DAYS_ORDER,
  });
  const [storyState, setStoryState] = useState<'stop' | 'continue' | 'none'>('none');

useEffect(() => {
  const stored = sessionStorage.getItem('activeStory');
  if (stored) {
    setStoryState('continue');
  } else {
    setStoryState('none');
  }
}, []);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`http://127.0.0.1:5000/user-weekly-stats?user_id=${user.id}`);
        const data = await response.json();

        const km = Array(7).fill(0);
        const steps = Array(7).fill(0);
        const calories = Array(7).fill(0);

        data.forEach((entry: any) => {
          const dayIndex = DAYS_ORDER.indexOf(entry.day);
          if (dayIndex !== -1) {
            km[dayIndex] = entry.total_km;
            steps[dayIndex] = entry.total_steps;
            calories[dayIndex] = entry.total_calories;
          }
        });

        setWeeklyStats({ km, steps, calories, labels: DAYS_ORDER });
      } catch (error) {
        console.error('Errore nel caricamento statistiche:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#5D9C3F" />
        <Text style={styles.loadingText}>Loading your weekly stats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={require('@/assets/images/profilo.png')}
          style={styles.header}
          resizeMode="cover"
        >
          <Text style={styles.title}>Personal Area</Text>
        </ImageBackground>


        {/* KM */}
        <View style={styles.tabButtonsWrapper}>
          <View style={[styles.tabButton, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Rating</Text>
          </View>
          <View style={styles.tabButton}>
            <Text
              style={styles.tabText}
              onPress={() => router.push('/settings')}
            >
      Settings
    </Text>
  </View>
</View>


        <View style={styles.card}>
          <Text style={styles.cardTitle}>Km</Text>
          <BarChart
            data={{
              labels: weeklyStats.labels,
              datasets: [{ data: weeklyStats.km }],
            }}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            fromZero
            style={styles.chart}
          />
          <Text style={styles.cardFooter}>
            {weeklyStats.km.reduce((a, b) => a + b, 0).toFixed(2)} km in 7 days
          </Text>
        </View>

        {/* Calorie */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kcal</Text>
          <LineChart
            data={{
              labels: weeklyStats.labels,
              datasets: [{ data: weeklyStats.calories }],
            }}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            bezier
            fromZero
            style={styles.chart}
          />
          <Text style={styles.cardFooter}>
            {weeklyStats.calories.reduce((a, b) => a + b, 0).toFixed(0)} kcal in 7 days
          </Text>
        </View>

        {/* Steps */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Steps</Text>
          <BarChart
            data={{
              labels: weeklyStats.labels,
              datasets: [{ data: weeklyStats.steps }],
            }}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            fromZero
            style={styles.chart}
          />
          <Text style={styles.cardFooter}>
            {weeklyStats.steps.reduce((a, b) => a + b, 0)} steps in 7 days
          </Text>
        </View>
      </ScrollView>
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

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(91, 143, 63, ${opacity})`,
  labelColor: () => '#333',
  strokeWidth: 2,
  barPercentage: 0.6,
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#ddd',
  },
  propsForLabels: {
    fontFamily: 'Helvetica', 
    fontSize: 12,
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
  width: '100%',
  height: 250, 
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: 90,     
  marginBottom: 32,   
  backgroundColor: '#fff', 
},
title: {
  fontSize: 30,
  color: 'white',
  fontWeight: 'bold',
  textAlign: 'center',
},
  container: {
    alignItems: 'center',
    paddingBottom: 150,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 20,
    padding: 16,
    width: screenWidth - 32,
    borderWidth: 1,
    borderColor: '#5D9C3F',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardFooter: {
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
  },
  chart: {
    borderRadius: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#444',
  },
  tabButtonsWrapper: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: 12,
  marginBottom: 20,
},

tabButton: {
  paddingVertical: 12,
  paddingHorizontal: 32,
  backgroundColor: '#fff',
  marginHorizontal: 16,
  borderRadius: 30,
  shadowColor: '#000',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 6,
  elevation: 5,
},

tabText: {
  fontSize: 18,
  color: '#333',
},

activeTab: {
  backgroundColor: '#fff',
},

activeTabText: {
  fontWeight: 'bold',
  color: '#000',
},


});
