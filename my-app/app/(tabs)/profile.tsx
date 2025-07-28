import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import BottomNavbar from '@/components/navigation/BottomNavbar';

const screenWidth = Dimensions.get('window').width;

export default function ProfileStatistics() {
  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>

      <ImageBackground
        source={require('@/assets/images/profilo.png')}
        style={styles.header}
        resizeMode="cover"
      >
        <Text style={styles.title}>Personal area</Text>
      </ImageBackground>

      {/* Contenuto scrollabile */}
        {/* KM Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Km</Text>
          <BarChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  data: [2.1, 1.8, 2.5, 1.4, 2.2, 3.0, 2.4],
                  colors: [
                    () => '#D84171',
                    () => '#F3B1C8',
                    () => '#5D9C3F',
                    () => '#D84171',
                    () => '#5D9C3F',
                    () => '#F3B1C8',
                    () => '#D84171',
                  ],
                },
              ],
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            withCustomBarColorFromData
            flatColor
          />
          <Text style={styles.cardFooter}>15,30 km in 7 days</Text>
        </View>

        {/* Kcal Line Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kcal</Text>
          <LineChart
            data={{
              labels: ['200', '300', '400', '500', '600'],
              datasets: [
                {
                  data: [250, 280, 300, 350, 400, 480, 520],
                  color: () => '#D84171',
                },
              ],
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <Text style={styles.cardFooter}>1500 kcal in 7 days</Text>
        </View>

        {/* Steps Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total steps</Text>
          <BarChart
            data={{
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                {
                  data: [6000, 7500, 9000, 7000, 10000, 8000, 7200],
                },
              ],
            }}
            width={screenWidth - 40}
            height={180}
            chartConfig={chartConfig}
            fromZero
            style={styles.chart}
          />
          <Text style={styles.cardFooter}>10.000 steps in 7 days</Text>
        </View>
      </ScrollView>

      {/* Navbar in basso */}
      <BottomNavbar state="start" onPress={() => {}} />
    </View>
  );
}

const chartConfig = {
  backgroundGradientFrom: 'rgba(255,255,255,0.9)',
  backgroundGradientTo: 'rgba(255,255,255,0.9)',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(91, 143, 63, ${opacity})`,
  labelColor: () => '#333',
  strokeWidth: 2,
  barPercentage: 0.6,
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: '#ddd',
  },
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    paddingBottom: 150, // spazio per la navbar
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
});
