import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter, type Href } from 'expo-router';

export default function BottomNavbar() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Start your story!</Text>
      </View>

      <View style={styles.navbar}>
        <NavButton onPress={() => router.push('/home')} source={require('@/assets/images/home_active.jpg')} />
        <NavButton onPress={() => router.push('/places')} source={require('@/assets/images/places.jpg')} />
        <NavButton onPress={() => router.push('/goals')} source={require('@/assets/images/trophy.jpg')} />
        <NavButton onPress={() => router.push('/profile')} source={require('@/assets/images/profile.jpg')} />
      </View>
    </View>
  );
}

function NavButton({ onPress, source }: { onPress: () => void; source: any }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Image source={source} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badge: {
    backgroundColor: '#5D9C3F',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    gap: 24,
  },
  button: {
    padding: 8,
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
