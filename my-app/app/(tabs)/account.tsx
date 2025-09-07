// app/account.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  ImageBackground,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNavbar from '@/components/navigation/BottomNavbar';

type User = { id: number; name: string; username: string; email: string; password?: string };
type Preference = { id: number; user_id: number; genre?: string | null; point_of_interest?: string | null };

const API_BASE = 'http://127.0.0.1:5000'; 

export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [prefs, setPrefs] = useState<Preference[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPwd, setShowPwd] = useState(false);

  const [storyState, setStoryState] = useState<'start' | 'stop' | 'continue'>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('storyState');
      if (saved === 'start' || saved === 'stop' || saved === 'continue') return saved as any;
      const hasStory = !!sessionStorage.getItem('activeStory');
      return hasStory ? 'stop' : 'start';
    }
    return 'start';
  });

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('activeStory') : null;
    if (stored) setStoryState(prev => (prev === 'start' ? 'stop' : prev));
    else setStoryState('start');
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('storyState', storyState);
    }
  }, [storyState]);

  const fetchData = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('user');
      if (!raw) {
        router.replace('/');
        return;
      }
      const stored = JSON.parse(raw) as User;

      const [uRes, pRes] = await Promise.all([
        fetch(`${API_BASE}/test-get-user?user_id=${stored.id}`),
        fetch(`${API_BASE}/preferences?user_id=${stored.id}`),
      ]);

      if (!uRes.ok) throw new Error('Errore caricamento utente');
      const freshUser = await uRes.json();
      setUser(freshUser || stored);

      const pJson = await pRes.json();
      if (pRes.ok && pJson?.success && Array.isArray(pJson.preferences)) {
        setPrefs(pJson.preferences as Preference[]);
      } else {
        setPrefs([]);
      }
    } catch (e: any) {
      console.warn(e);
      Alert.alert('Errore', 'Impossibile caricare i dati account');
    }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  // Split preferenze: generi e punti di interesse
  const genres = useMemo(
    () => (prefs || []).map(p => p.genre).filter(Boolean) as string[],
    [prefs]
  );
  const points = useMemo(
    () => (prefs || []).map(p => p.point_of_interest).filter(Boolean) as string[],
    [prefs]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Utente non trovato</Text>
        <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
          <Text style={styles.backTxt}>Login</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <ImageBackground
          source={require('@/assets/images/profilo.png')}
          style={styles.header}
          resizeMode="cover"
        >
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.push('/settings')} style={styles.backIcon}>
              <Feather name="chevron-left" size={22} color="#333" />
            </Pressable>
          </View>
          <Text style={styles.title}>Account</Text>
        </ImageBackground>

        {/* Card dati utente */}
        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>
          <View style={styles.divider} />

          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{user.username}</Text>
          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Password</Text>
              <Text style={styles.value}>
                {showPwd ? (user.password || '') : '•'.repeat(Math.max((user.password || '').length, 8))}
              </Text>
            </View>
            <Pressable onPress={() => setShowPwd(s => !s)} style={styles.eyeBtn}>
              <Feather name={showPwd ? 'eye-off' : 'eye'} size={18} color="#333" />
            </Pressable>
          </View>
        </View>

        {/* Card generi */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferred Genres</Text>
          {genres.length === 0 ? (
            <Text style={styles.muted}>No genres selected yet.</Text>
          ) : (
            <View style={styles.badgesWrap}>
              {genres.map((g, i) => (
                <View key={`${g}-${i}`} style={styles.badge}>
                  <Text style={styles.badgeText}>{g}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.editBtn}
            onPress={() => router.push({ pathname: '/preferences', params: { returnTo: '/account' } })}
          >
            <Feather name="edit-2" size={14} color="#fff" />
            <Text style={styles.editTxt}>Edit Preferences</Text>
          </Pressable>
        </View>

        {/* Card punti di interesse */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Preferred Points of Interest</Text>
          {points.length === 0 ? (
            <Text style={styles.muted}>No points selected yet.</Text>
          ) : (
            <View style={styles.badgesWrap}>
              {points.map((p, i) => (
                <View key={`${p}-${i}`} style={styles.badge}>
                  <Text style={styles.badgeText}>{p}</Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={styles.editBtn}
            onPress={() => router.push({ pathname: '/pointsOfInterest', params: { returnTo: '/account' } })}
          >
            <Feather name="edit-2" size={14} color="#fff" />
            <Text style={styles.editTxt}>Edit Points of Interest</Text>
          </Pressable>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Navbar */}
      <BottomNavbar
        state={storyState}
        onPress={() => {
          if (storyState === 'start') {
            router.push('/time');
          } else {
            setStoryState(prev => (prev === 'stop' ? 'continue' : 'stop'));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { paddingBottom: 150, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },

  header: {
    width: '100%',
    height: 250,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 90,
    marginBottom: 32,
    backgroundColor: '#fff',
  },
  headerTop: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  backIcon: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },

  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 14,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },

  label: { fontSize: 13, color: '#666' },
  value: { fontSize: 16, color: '#111', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  row: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F2F2F2', marginLeft: 8,
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  muted: { color: '#777' },
  badgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, borderWidth: 1,
    borderColor: '#D84171', backgroundColor: '#fff',
  },
  badgeText: { color: '#D84171', fontWeight: '600' },

  editBtn: {
    marginTop: 14, alignSelf: 'flex-start',
    backgroundColor: '#5D9C3F', borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  editTxt: { color: '#fff', fontWeight: '600' },

  backBtn: { marginTop: 12, backgroundColor: '#5D9C3F', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  backTxt: { color: '#fff', fontWeight: '600' },

  rowAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionText: { fontSize: 15, color: '#333' },
});
