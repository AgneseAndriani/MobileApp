import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import BottomNavbar from '@/components/navigation/BottomNavbar';
import { useState } from 'react';

const OPTIONS = [
  { label: 'Account', icon: <Feather name="user" size={20} color="#333" /> },
  { label: 'Notifications', icon: <Feather name="bell" size={20} color="#333" /> },
  { label: 'Appearance', icon: <Feather name="eye" size={20} color="#333" /> },
  { label: 'Privacy & Security', icon: <Feather name="lock" size={20} color="#333" /> },
  { label: 'Help and Support', icon: <Feather name="headphones" size={20} color="#333" /> },
  { label: 'About', icon: <Feather name="info" size={20} color="#333" /> },
];

export default function Settings() {
    const [storyState, setStoryState] = useState<'stop' | 'continue' | 'none'>('none');

    useEffect(() => {
    const stored = sessionStorage.getItem('activeStory');
    if (stored) {
        setStoryState('continue');
    } else {
        setStoryState('none');
    }
    }, []);


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
            <Text
              style={styles.tabText}
              onPress={() => router.push('/profile')}
            >
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

  {/* Logout Option */}
        <Pressable
          style={styles.optionItem}
          onPress={() => {
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
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
  optionsContainer: {
    width: '90%',
    marginTop: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
});
