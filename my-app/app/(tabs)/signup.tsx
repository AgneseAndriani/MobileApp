import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import LayoutWrapper from '@/components/LayoutWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const RegisterScreen = () => {
  const router = useRouter(); 

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const total_km = 0;
  const total_calories = 0;
  const total_steps = 0;

  const handleRegister = async () => {
    if (!email || !username) {
      alert('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:5000/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { name, username, email, password, total_km, total_calories, total_steps }
        }),
      });
      const data = await response.json();
    if (data.success) {
      // Salva l’utente loggato localmente
      localStorage.setItem('user', JSON.stringify(data.user));
    }
      if (data && data.id) {
        router.push('/create');
      } else {
        alert('Registrazione fallita');
      }
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      alert('Errore di rete');
    }
  };

  return (
    <LayoutWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView keyboardShouldPersistTaps="handled">
          {/* Header con immagine */}
          <ImageBackground
            source={require('@/assets/images/shapes.png')}
            style={styles.header}
            imageStyle={styles.headerImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>Enter your details</Text>
            </View>
          </ImageBackground>

          {/* Form sotto l'immagine */}
          <View style={styles.formWrapper}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword(p => !p)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={wp('5%')} color="#666" />
              </Pressable>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable onPress={() => setShowConfirm(p => !p)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? 'eye-off' : 'eye'} size={wp('5%')} color="#666" />
              </Pressable>
            </View>

            <Pressable style={styles.nextButton} onPress={handleRegister}>
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          </View>
        </ScrollView>

        {/* Bottone Indietro */}
        <Pressable style={styles.backButton} onPress={() => router.push('/')}>
          <Ionicons name="arrow-back" size={wp('6%')} color="white" />
        </Pressable>
      </SafeAreaView>
    </LayoutWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    width: '100%',
    height: hp('50%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: hp('15%'),
    width: '100%',
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: wp('8%'), fontWeight: '700' },
  subtitle: { color: '#fff', fontSize: wp('4.5%'), marginTop: hp('1%') },
  formWrapper: {
    width: wp('80%'),
    alignSelf: 'center',
    marginVertical: hp('5%'),    
  },
  label: { color: '#000', fontSize: wp('4%'), marginBottom: hp('0.5%') },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#5D9C3F',
    paddingVertical: hp('1%'),
    fontSize: wp('4%'),
    color: '#333',
    marginBottom: hp('2%'),
  },
  passwordWrapper: { position: 'relative' },
  eyeIcon: { position: 'absolute', right: wp('2%'), top: hp('1.8%') },
  nextButton: {
    backgroundColor: '#5D9C3F',
    paddingVertical: hp('1.2%'),
    width: wp('30%'),
    alignSelf: 'flex-end',
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  nextText: { color: '#fff', fontSize: wp('4%'), fontWeight: '600' },
  backButton: {
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
});

export default RegisterScreen;
