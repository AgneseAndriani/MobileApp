import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

type Props = {
  state: 'start' | 'stop' | 'continue';
  onPress: () => void;
};

export default function BottomNavbar({ state, onPress }: Props) {
  const router = useRouter();
  const pathname = usePathname(); // pagina attuale

  const getBadgeStyle = () => {
    switch (state) {
      case 'start':
        return { backgroundColor: '#5D9C3F' };
      case 'stop':
      case 'continue':
        return { backgroundColor: '#D84171' };
      default:
        return { backgroundColor: '#ccc' };
    }
  };

  const getBadgeLabel = () => {
    switch (state) {
      case 'start':
        return 'Start your story!';
      case 'stop':
        return '▶';
      case 'continue':
        return '⏸';
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
      style={[styles.badge, getBadgeStyle()]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        state === 'start'
          ? 'Start your story'
          : state === 'continue'
          ? 'Play'
          : 'Pause'
      }
    >
      <Text style={[styles.badgeText, state !== 'start' && styles.badgeIcon]}>
        {getBadgeLabel()}
      </Text>
    </Pressable>

      <View style={styles.navbar}>
        <NavButton
          active={pathname === '/home' || pathname === '/story'}
          defaultSrc={require('@/assets/images/home.png')}
          activeSrc={require('@/assets/images/home_pressed.jpg')}
          onPress={() => {
            try {
              const story = sessionStorage.getItem('activeStory');
              const parsed = story ? JSON.parse(story) : null;

              if (parsed && Array.isArray(parsed.points) && parsed.points.length > 0) {
                router.push('/story');
              } else {
                router.push('/home');
              }
            } catch (err) {
              console.error('Errore nella lettura della storia:', err);
              router.push('/home');
            }
          }}
        />

        <NavButton
          active={pathname === '/points'}
          defaultSrc={require('@/assets/images/points.jpg')}
          activeSrc={require('@/assets/images/points_pressed.png')}
          onPress={() => router.push('/points')}
        />

        <NavButton
          active={pathname === '/goals'}
          defaultSrc={require('@/assets/images/trophy.jpg')}
          activeSrc={require('@/assets/images/trophy_pressed.png')}
          onPress={() => router.push('/goals')}
        />

        <NavButton
          active={pathname === '/profile' || pathname === '/settings' || pathname === '/account'}
          defaultSrc={require('@/assets/images/profile.jpg')}
          activeSrc={require('@/assets/images/profile_pressed.png')}
          onPress={() => router.push('/profile')}
        />
      </View>
    </View>
  );
}

function NavButton({
  onPress,
  defaultSrc,
  activeSrc,
  active,
}: {
  onPress: () => void;
  defaultSrc: any;
  activeSrc: any;
  active: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Image source={active ? activeSrc : defaultSrc} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badgeIcon: {
    fontSize: 18,
    lineHeight: 22,
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