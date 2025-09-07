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
  'Playgrounds',                     // Aree_Gioco
  'Castles',                         // Castelli
  'Monuments',                       // Monumenti
  'Historic Houses',                 // Case_storiche
  'Historic Boats',                  // Barche_storiche
  'Archaeological Sites',            // Siti_archeologici
  'Giant Benches',                   // Panchine_Giganti
  'Scenic Viewpoints',               // Punti_Panoramici
  'Parks',                           // Parchi
  'Churches',                        // Chiese
  'Botanical Gardens',               // Botanical gardens
  'War Memorials',                   // War memorials
  'Public Art Installations',        // Public art installation
];

export default function PointsOfInterestScreen() {
  const router = useRouter();
  const { userId: userIdParam, returnTo } =
    useLocalSearchParams<{ userId?: string; returnTo?: string }>();

  const [selectedPOI, setSelectedPOI] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

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
        const to = typeof returnTo === 'string' && returnTo.length > 0
          ? (returnTo.startsWith('/') ? returnTo : `/${returnTo}`)
          : '';

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
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network error');
    } finally {
      setLoading(false);
    }
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
        {/* Titolo */}
        <Text style={styles.title}>
          Choose your preferred{'\n'}points of interest
        </Text>

        <View style={styles.listContainer}>
          <FlatList
            data={poiOptions}
            renderItem={renderPOI}
            keyExtractor={item => item}
            numColumns={1}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Frecce in basso */}
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={() => router.push('/preferences')}>
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

  row: {
    justifyContent: 'space-between',
    marginBottom: hp('2.5%'),
  },
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
  poiButtonSelected: { backgroundColor: '#D8D8D8' },
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
