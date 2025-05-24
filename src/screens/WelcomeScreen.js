import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

const WelcomeScreen = ({ navigation }) => {
  return (
    <LinearGradient colors={colors.gradientePrimario} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/avatardanidev.png')} 
          style={styles.logo}
        />
        <Text style={styles.title}>¡Bienvenido a App Empleos!</Text>
        <Text style={styles.subtitle}>
          Encuentra las mejores oportunidades laborales y gestiona tu carrera profesional
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.buttonText, styles.loginButtonText]}>
            Ya tengo una cuenta
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 50,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.luminous,
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: colors.variante5,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    gap: 15,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  registerButton: {
    backgroundColor: colors.principal,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.luminous,
  },
  buttonText: {
    color: colors.luminous,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButtonText: {
    color: colors.luminous,
  },
});

export default WelcomeScreen; 