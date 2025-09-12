import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LayoutWrapper from '@/components/LayoutWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const genreOptions = [
  'History',
  'Architecture',
  'Mystery',
  'Legends',
  'Adventure',
  'Fantasy',
  'Mythology',
  'Romance',
];

export default function PreferencesScreen() {
  const router = useRouter();
  const { userId: userIdParam, returnTo } =
    useLocalSearchParams<{ userId?: string; returnTo?: string }>();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [prefetching, setPrefetching] = useState(false);

  // Se arrivo dal signup NON precompilo (è una scelta, puoi anche togliere questa condizione)
  const cameFromSignup = returnTo === 'signup' || returnTo === '/signup';

  // 1) Recupera userId: dai params oppure da AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      if (userIdParam) {
        setUserId(Number(userIdParam));
        return;
      }
      try {
        const raw = await AsyncStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.id) setUserId(Number(u.id));
        }
      } catch (e) {
        console.warn('Impossibile leggere utente da AsyncStorage', e);
      }
    };
    loadUser();
  }, [userIdParam]);

  // 2) Se è "edit" (non da signup) pre-carica le preferenze salvate e popola selectedGenres
  useEffect(() => {
    const preloadPreferences = async () => {
      if (!userId || cameFromSignup) return;

      try {
        setPrefetching(true);
        // ⚠️ usa la porta del tuo backend (il tuo Flask, nel codice sotto, fa serve su 3050)
        const res = await fetch(`http://127.0.0.1:5000/preferences?user_id=${userId}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.preferences)) {
          const genresFromDb = json.preferences
            .map((p: any) => p.genre)
            .filter((g: any) => typeof g === 'string' && g.trim().length > 0);

          // Evita duplicati e mantieni solo quelli presenti in genreOptions (se vuoi)
          const unique = Array.from(new Set(genresFromDb)).filter(g =>
            genreOptions.includes(g)
          );
          setSelectedGenres(unique);
        }
      } catch (e) {
        console.warn('Errore nel pre-caricamento preferenze', e);
      } finally {
        setPrefetching(false);
      }
    };

    preloadPreferences();
  }, [userId, cameFromSignup]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSavePreferences = async () => {
    if (!userId) {
      Alert.alert('Utente non trovato', 'Rieffettua il login.');
      return;
    }
    if (selectedGenres.length === 0) {
      Alert.alert('Seleziona almeno un genere');
      return;
    }

    setLoading(true);
    try {
      // ⚠️ Assicurati che la porta sia quella giusta: nel server Python usi 3050
      const response = await fetch('http://127.0.0.1:5000/preferences/adding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          genres: selectedGenres,
        }),
      });

      const data = await response.json();

      if (data?.success) {
        if (cameFromSignup) {
          router.replace({
            pathname: '/pointsOfInterest',
            params: {
              userId: String(userId),
              returnTo: '/preferences',
            },
          });
          return;
        }

        if (typeof returnTo === 'string' && returnTo.length > 0) {
          router.replace(returnTo);
          return;
        }
        if (router.canGoBack?.()) {
          router.back();
          return;
        }
        router.replace('/account');
      } else {
        Alert.alert('Salvataggio non riuscito', data?.message || 'Riprova più tardi');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Errore di rete');
    } finally {
      setLoading(false);
    }
  };

  const renderGenre = ({ item }: { item: string }) => {
    const isSelected = selectedGenres.includes(item);
    return (
      <Pressable
        onPress={() => toggleGenre(item)}
        style={[styles.genreButton, isSelected && styles.genreButtonSelected]}
      >
        <Text style={[styles.genreText, isSelected && styles.genreTextSelected]}>
          {item}
        </Text>
      </Pressable>
    );
  };

  return (
    <LayoutWrapper>
      <ImageBackground
        source={require('@/assets/images/time.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>
            Choose your{'\n'}preferred story{'\n'}genres
          </Text>

          <View style={styles.listContainer}>
            {prefetching ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={genreOptions}
                renderItem={renderGenre}
                keyExtractor={item => item}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Pressable
              style={[styles.button, selectedGenres.length === 0 && { opacity: 0.5 }]}
              onPress={handleSavePreferences}
              disabled={loading || selectedGenres.length === 0}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="arrow-forward" size={24} color="white" />
              )}
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp('12%'),
    paddingHorizontal: wp('10%'),
  },
  title: {
    fontSize: wp('7%'),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('3%'),
  },
  listContainer: {
    flex: 1,
    width: '100%',
    marginBottom: hp('10%'),
  },
  row: { justifyContent: 'space-between', marginBottom: hp('2%') },
  genreButton: {
    flex: 1,
    marginHorizontal: wp('1.5%'),
    borderWidth: 2,
    borderColor: '#D84171',
    paddingVertical: hp('1.5%'),
    borderRadius: wp('5%'),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    alignItems: 'center',
  },
  genreButtonSelected: { backgroundColor: '#D8D8D8' }, // grigio quando selezionato
  genreText: {
    color: '#D84171',
    fontWeight: '600',
    fontSize: wp('4%'),
    textAlign: 'center',
  },
  genreTextSelected: { color: '#333' },
  button: {
    width: wp('12%'),
    height: wp('12%'),
    backgroundColor: '#5D9C3F',
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: wp('30%'),
    position: 'absolute',
    bottom: hp('3%'),
    alignSelf: 'center',
  },
});
