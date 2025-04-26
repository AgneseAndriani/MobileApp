import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const AccountCreatedScreen = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/home');
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <ImageBackground
        source={require('@/assets/images/create.png')}
        style={styles.background}
        imageStyle={styles.image}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Your account has{'\n'}been created!</Text>
          <Text style={styles.subtitle}>Tap to start</Text>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

export default AccountCreatedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
  },
  title: {
    fontSize: wp('8%'),
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: hp('10%'),
  },
  subtitle: {
    fontSize: wp('7.5%'),
    color: '#fff',
    textAlign: 'center',
    marginBottom: hp('15%')
  },
});
