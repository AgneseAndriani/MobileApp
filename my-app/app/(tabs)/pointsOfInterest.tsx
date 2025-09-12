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

const poiOptions = [
  'Playgrounds',
  'Castles',
  'Monuments',
  'Historic Houses',
  'Historic Boats',
  'Archaeological Sites',
  'Giant Benches',
  'Scenic Viewpoints',
  'Parks',
  'Churches',
  'Botanical Gardens',
  'War Memorials',
  'Public Art Installations',
];

export default function PointsOfInterestScreen() {
  const router = useRouter();
  const { userId: userIdParam, returnTo } =
    useLocalSearchParams<{ userId?: string; returnTo?: string }>();

  const [selectedPOI, setSelectedPOI] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [prefetching, setPrefetching] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // normalizza returnTo in rotta assoluta 
  const normReturnTo = (v?: string) => {
    if (!v) return '';
    return v.startsWith('/') ? v : `/${v}`;
  };
  const to = normReturnTo(returnTo);

  // 1) Recupera userId da AsyncStorage
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
        console.warn('Unable to read user from AsyncStorage', e);
      }
    };
    loadUser();
  }, [userIdParam]);

  // 2) Precarica i POI già salvati per l'utente
  useEffect(() => {
    const preloadPOI = async () => {
      if (!userId) return;
      try {
        setPrefetching(true);
        const res = await fetch(`http://127.0.0.1:5000/preferences?user_id=${userId}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.preferences)) {
          const poiFromDb = json.preferences
            .map((p: any) => p.point_of_interest)
            .filter((x: any) => typeof x === 'string' && x.trim().length > 0);

          const unique = Array.from(new Set(poiFromDb)).filter(p => poiOptions.includes(p));
          setSelectedPOI(unique);
        }
      } catch (e) {
        console.warn('Errore preload POI', e);
      } finally {
        setPrefetching(false);
      }
    };
    preloadPOI();
  }, [userId]);

  const togglePOI = (poi: string) => {
    setSelectedPOI(prev =>
      prev.includes(poi) ? prev.filter(p => p !== poi) : [...prev, poi]
    );
  };

  const handleSavePOI = async () => {
    if (!userId) {
      Alert.alert('User not found', 'Please log in again.');
      return;
    }
    if (selectedPOI.length === 0) {
      Alert.alert('Select at least one point of interest');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/pointOfInterest/adding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          point_of_interest: selectedPOI,
        }),
      });

      const data = await response.json();

      if (data?.success) {
        if (to === '/preferences') {
          router.replace('/create');
          return;
        }
        if (to === '/account') {
          router.replace('/account');
          return;
        }
        if (router.canGoBack?.()) {
          router.back();
          return;
        }
        router.replace('/account');
      } else {
        Alert.alert('Save failed', data?.message || 'Please try again later.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (to === '/account') {
      router.replace('/account');
      return;
    }
    if (to === '/preferences') {
      router.replace('/preferences');
      return;
    }
    if (router.canGoBack?.()) {
      router.back();
      return;
    }
    router.replace('/account');
  };

  const renderPOI = ({ item }: { item: string }) => {
    const isSelected = selectedPOI.includes(item);
    return (
      <Pressable
        onPress={() => togglePOI(item)}
        style={[styles.poiButton, isSelected && styles.poiButtonSelected]}
      >
        <Text
          style={[styles.poiText, isSelected && styles.poiTextSelected]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
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
            Choose your preferred{'\n'}points of interest
          </Text>

          <View style={styles.listContainer}>
            {prefetching ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={poiOptions}
                renderItem={renderPOI}
                keyExtractor={item => item}
                numColumns={1}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Pressable
              style={[styles.button, selectedPOI.length === 0 && { opacity: 0.5 }]}
              onPress={handleSavePOI}
              disabled={loading || selectedPOI.length === 0}
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
  overlay: { flex: 1, alignItems: 'center', paddingTop: hp('12%'), paddingHorizontal: wp('10%') },
  title: {
    fontSize: wp('7%'),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('5%'),
  },
  listContainer: {
    flex: 1,
    width: '100%',
    marginBottom: hp('10%'),
  },
  row: { justifyContent: 'space-between', marginBottom: hp('2.5%') },
  poiButton: {
    width: '100%',
    minHeight: hp('8%'),
    marginVertical: hp('1%'),
    borderWidth: 2,
    borderColor: '#D84171',
    borderRadius: wp('4%'),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  poiButtonSelected: { backgroundColor: '#D8D8D8' }, // grigio quando selezionato
  poiText: {
    color: '#D84171',
    fontWeight: '600',
    fontSize: wp('4.2%'),
    textAlign: 'center',
  },
  poiTextSelected: { color: '#333' },
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
