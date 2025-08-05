import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LayoutWrapper from '@/components/LayoutWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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

export default function ThemesScreen() {
  const router = useRouter();
  const { duration, place } = useLocalSearchParams();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genres: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genres)
        ? prev.filter((g) => g !== genres)
        : [...prev, genres]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration,
          place: place || null,
          genres: selectedGenres,
        }),
      });

      const data = await response.json();

      if (data && data.story && data.points) {
        router.push({
          pathname: '/story',
          params: {
            story: JSON.stringify(data.story),
            points: JSON.stringify(data.points),
            questions: JSON.stringify(data.questions),
          },
        });
      } else {
        alert('No story found.');
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching story');
    } finally {
      setLoading(false);
    }
  };

  const renderGenre = ({ item }: { item: string }) => {
    const isSelected = selectedGenres.includes(item);
    return (
      <Pressable
        onPress={() => toggleGenre(item)}
        style={[
          styles.genreButton,
          isSelected && styles.genreButtonSelected,
        ]}
      >
        <Text
          style={[
            styles.genreText,
            isSelected && styles.genreTextSelected,
          ]}
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
          <Text style={styles.title}>Choose your{'\n'}preferred story{'\n'}genres</Text>

          <FlatList
            data={genreOptions}
            renderItem={renderGenre}
            keyExtractor={(item) => item}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.genresWrapper}
          />

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={() => router.push('/places')}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
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
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
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
    marginBottom: hp('5%'),
  },
  genresWrapper: {
    justifyContent: 'center',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
  },
  genreButton: {
    borderWidth: 2,
    borderColor: '#D84171',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('5%'),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    marginHorizontal: wp('2%'),
  },
  genreButtonSelected: {
    backgroundColor: '#D8D8D8',
  },
  genreText: {
    color: '#D84171',
    fontWeight: '600',
    fontSize: wp('4%'),
  },
  genreTextSelected: {
    color: '#333',
  },
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
