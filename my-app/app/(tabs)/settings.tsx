import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import BottomNavbar from '@/components/navigation/BottomNavbar';

const OPTIONS = [
  { label: 'Account', icon: <Feather name="user" size={20} color="#333" /> },
  { label: 'Notifications', icon: <Feather name="bell" size={20} color="#333" /> },
  { label: 'Appearance', icon: <Feather name="eye" size={20} color="#333" /> },
  { label: 'Privacy & Security', icon: <Feather name="lock" size={20} color="#333" /> },
  { label: 'Help and Support', icon: <Feather name="headphones" size={20} color="#333" /> },
  { label: 'About', icon: <Feather name="info" size={20} color="#333" /> },
];

export default function Settings() {
  // stato badge persistente
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
    if (stored) setStoryState(prev => (prev === 'start' ? 'stop' : prev));
    else setStoryState('start');
  }, []);

  // sincronizza su storage a ogni cambio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('storyState', storyState);
    }
  }, [storyState]);

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <ImageBackground
          source={require('@/assets/images/profilo.png')}
          style={styles.header}
          resizeMode="cover"
        >
          <Text style={styles.title}>Settings</Text>
        </ImageBackground>

        {/* Top Tabs */}
        <View style={styles.tabButtonsWrapper}>
          <View style={styles.tabButton}>
            <Text style={styles.tabText} onPress={() => router.push('/profile')}>
              Rating
            </Text>
          </View>
          <View style={[styles.tabButton, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Settings</Text>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((item, index) => (
            <Pressable key={index} style={styles.optionItem}>
              <View style={styles.optionLeft}>
                {item.icon}
                <Text style={styles.optionText}>{item.label}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#999" />
            </Pressable>
          ))}

          {/* Logout */}
          <Pressable
            style={styles.optionItem}
            onPress={() => {
              sessionStorage.removeItem('storyState'); // reset badge
              sessionStorage.clear();
              localStorage.clear();
              router.replace('/');
            }}
          >
            <View style={styles.optionLeft}>
              <Feather name="log-out" size={20} color="#333" />
              <Text style={styles.optionText}>Logout</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </Pressable>
        </View>
      </ScrollView>

      {/* Navbar coerente e persistente */}
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
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { alignItems: 'center', paddingBottom: 150 },
  header: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    marginBottom: 32,
    backgroundColor: '#fff',
  },
  title: { fontSize: 30, color: 'white', fontWeight: 'bold', textAlign: 'center' },
  tabButtonsWrapper: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, marginBottom: 20 },
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
  tabText: { fontSize: 18, color: '#333' },
  activeTab: { backgroundColor: '#fff' },
  activeTabText: { fontWeight: 'bold', color: '#000' },
  optionsContainer: { width: '90%', marginTop: 10 },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionText: { fontSize: 16, color: '#333' },
});
