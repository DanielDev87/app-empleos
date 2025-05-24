import React,{useEffect} from 'react';
import { Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

const SplashScreen = () => {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigation.replace('Welcome')
        }, 3000);
        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <LinearGradient colors={colors.gradientePrimario} style={styles.container}>
            <Text style={styles.text}>Loading...</Text>
            <Image source={require('../../assets/avatardanidev.png')} style={styles.logo} />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        color: colors.luminous,
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
});

export default SplashScreen;