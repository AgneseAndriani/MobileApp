import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useState } from 'react';
import LayoutWrapper from '@/components/LayoutWrapper';



const LoginScreen = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),

            });
            const data = await response.json();

            if (data.success) {
                router.push('/home' as Href<string>);
                
              
            } else {
                alert('Credenziali non valide');
            }
        } catch (error) {
            console.log('Errore:', error);
            alert('Errore di connessione');
        }
    };

    return (
        <LayoutWrapper>
            <View style={styles.container}>
                {/* Sfondo grafico */}
                <View style={styles.header}>
                    <View style={styles.redShape} />
                    <View style={styles.pinkShape} />
                    <View style={styles.greenShape}>
                        <Text style={styles.title}>Welcome back!</Text>
                        <Text style={styles.subtitle}>Enter your details</Text>
                    </View>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Text style={styles.label}>Username or E-mail Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="email@example.com"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <Pressable onPress={() => setShowPassword(prev => !prev)} style={styles.eyeIcon}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="gray" />
                        </Pressable>
                    </View>

                    <Pressable style={styles.nextButton} onPress={handleLogin}>
                        <Text style={styles.nextButtonText}>Next</Text>
                    </Pressable>

                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={28} color="#5D9C3F" />
                    </Pressable>
                </View>
            </View>
        </LayoutWrapper>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        height: '40%',
        position: 'relative',
    },
    redShape: {
        backgroundColor: '#DB2763',
        position: 'absolute',
        width: 500,
        height: 200,
        borderRadius: 150,
        top: 100,
        left: -20,
        right: -80,
        zIndex: 2,
    },
    pinkShape: {
        backgroundColor: '#F1B2CB',
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        top: 140,
        left: 0,
        zIndex: 1,
    },

    greenShape: {
        backgroundColor: '#5D9C3F',
        height: 300,
        width: '120%',
        borderBottomLeftRadius: 300,
        borderBottomRightRadius: 300,
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3,
    },
    title: {
        color: '#fff',
        fontSize: 35,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#fff',
        fontSize: 18,
        marginTop: 8,
    },
    form: {
        padding: 50,
        gap: 15,
    },
    label: {
        color: 'black',
        fontSize: 18,
        marginBottom: 4,
    },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#5D9C3F',
        paddingVertical: 8,
        paddingRight: 35,
        fontSize: 18,
        color: 'gray',
    },
    passwordWrapper: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: 0,
        top: 10,
    },
    nextButton: {
        marginTop: 30,
        backgroundColor: '#5D9C3F',
        paddingVertical: 14,
        borderRadius: 20,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 30,
        alignSelf: 'center',
        width: 48,
        height: 48,
        backgroundColor: '#E7F2E8',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
