import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import LayoutWrapper from '@/components/LayoutWrapper';

const { width } = Dimensions.get('window');

const WelcomePage = () => {
    return (
        <LayoutWrapper>
            <View style={styles.container}>
                {/* Immagine */}
                <View style={styles.imageWrapper}>
                    <Image 
                        source={require('@/assets/images/hi.png')} 
                        style={styles.image} 
                        resizeMode="cover" 
                    />
                    <Text style={styles.welcomeText}>Hi!</Text>
                </View>

                {/* Pulsanti */}
                <View style={styles.buttonsContainer}>
                    <Link href="/login" asChild>
                        <Pressable style={styles.button}>
                            <Text style={styles.buttonText}>Login</Text>
                            <Text style={styles.arrow}>➜</Text>
                        </Pressable>
                    </Link>

                    <Link href="/signup" asChild>
                        <Pressable style={styles.button}>
                            <Text style={styles.buttonText}>New Account</Text>
                            <Text style={styles.arrow}>➜</Text>
                        </Pressable>
                    </Link>
                </View>
            </View>
        </LayoutWrapper>
    );
};

export default WelcomePage;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageWrapper: {
        width: '100%',
        height: '50%',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    welcomeText: {
        position: 'absolute',
        color: '#fff',
        fontSize: 70,
        fontWeight: 'bold',
        textAlign: 'center',
        left: '25%'
    },
    buttonsContainer: {
        marginTop: 40,
        paddingHorizontal: 30,
        gap: 20,
    },
    button: {
        backgroundColor: '#5D9C3F',
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 25,
        fontWeight: 'bold',
    },
    arrow: {
        color: '#f4b6cc',
        fontSize: 25,
        marginLeft: 10,
    },
});
