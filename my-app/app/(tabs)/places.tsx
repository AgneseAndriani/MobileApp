import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import LayoutWrapper from '@/components/LayoutWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export default function PlacesScreen() {
  const router = useRouter();
  const { duration } = useLocalSearchParams();
  const [place, setPlace] = useState('');

  const goToGenre = () => {
    router.push({
      pathname: '/genre',
      params: {
        duration,
        ...(place ? { place } : {}),
      },
    });
  };

  return (
    <LayoutWrapper>
      <ImageBackground
        source={require('@/assets/images/time.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>
            Do you want to{'\n'}add specific{'\n'}places to visit?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Write here..."
            placeholderTextColor="#aaa"
            value={place}
            onChangeText={setPlace}
          />

          <Pressable style={styles.skipButton} onPress={goToGenre}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

           <View style={styles.buttonRow}>
                      <Pressable style={styles.button} onPress={() => router.push('/time')}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                      </Pressable>
                      <Pressable style={styles.button} onPress={() => router.push('/genre')}>
                        <Ionicons name="arrow-forward" size={24} color="white" />
                      </Pressable>
              </View>
        </KeyboardAvoidingView>
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
    justifyContent: 'flex-start',
    paddingTop: hp('12%'),
    paddingHorizontal: wp('10%'),
  },
  title: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp('5%'),
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.8%'),
    fontSize: wp('4.5%'),
    marginBottom: hp('3%'),
  },
  skipButton: {
    backgroundColor: '#D84171',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('10%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginBottom: hp('10%'),
  },
  skipText: {
    color: '#fff',
    fontSize: wp('4.2%'),
    fontWeight: '600',
  },
  forwardButton: {
    position: 'absolute',
    bottom: hp('3%'),
    alignSelf: 'center',
    width: wp('10%'),
    height: wp('10%'),
    backgroundColor: '#5D9C3F',
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
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
