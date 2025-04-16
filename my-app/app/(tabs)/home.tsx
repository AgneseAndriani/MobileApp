import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏠 Benvenuto nella Home!</Text>
      <Text style={styles.subtitle}>Hai effettuato l’accesso con successo.</Text>

      <Pressable style={styles.button} onPress={() => router.push('/')}>
        <Text style={styles.buttonText}>Torna alla Login</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E7F2E8',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5D9C3F',
  },
  subtitle: {
    fontSize: 18,
    color: 'gray',
    marginVertical: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#5D9C3F',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
