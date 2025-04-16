import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';
import LayoutWrapper from '@/components/LayoutWrapper';


Dimensions.get('window');

const WelcomePage = () => {
    return (
       <LayoutWrapper> 
            <View style={styles.container}>
                {/* Sfondo con cerchi sovrapposti */}
                <View style={styles.shapesWrapper}>
                    <View style={styles.greenCircle} />
                    <View style={styles.pinkCircle} />
                    <View style={styles.redCircle} />
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
        justifyContent: 'flex-start',
    },
    background: {
        height: '50%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflow: 'visible',
        position: 'relative',
    },
    shapesWrapper: {
        height: '55%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'hidden',
    },
    greenCircle: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 500,
        backgroundColor: '#5D9C3F',
        top: -80,
        left: -150,
        zIndex: 3,
    },
    pinkCircle: {
        position: 'absolute',
        width: 460,
        height: 520,
        borderRadius: 400,
        backgroundColor: '#F1B2CB',
        top: -60,
        left: -80,
        zIndex: 2,
    },
    redCircle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#DB2763',
        top: -40,
        right: -100,
        zIndex: 1,
    },
    welcomeText: {
        color: 'white',
        fontSize: 70,
        fontWeight: 'bold',
        zIndex: 4,
        marginTop: 120,
        marginLeft: 100,
    },
    buttonsContainer: {
        marginTop: 100,
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

