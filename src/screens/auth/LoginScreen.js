import React, {useState} from 'react'
import colors from '../../constants/colors'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../services/firebaseConfig'
import { LinearGradient } from 'expo-linear-gradient'

const LoginScreen = ({navigation}) => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const handleLogin = ()=>{
      signInWithEmailAndPassword(auth, email, password)
      .then((userCredential)=>{
        setError(false);
        setErrorMessage('');
        navigation.replace('MainTabs');
      })
      .catch((error)=>{
        setError(true)
        setErrorMessage(error.message)
      })
    }

    return (
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <LinearGradient 
          colors={[colors.variante2, colors.variante5]} 
          style={styles.container}
        >
          <View style={styles.logoContainer}>
            <Image 
              style={styles.logo} 
              source={require('../../../assets/avatardanidev.png')} 
            />
            <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon name="email-outline" size={24} style={styles.icon} /> 
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                placeholderTextColor={colors.thin}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              /> 
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock-outline" size={24} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor={colors.thin}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            {error && (
              <Text style={styles.errorMessage}>
                Revisa tus credenciales e intenta nuevamente 😕
              </Text>
            )}

            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>¿Aún no tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    logoContainer: {
      alignItems: 'center',
      paddingTop: 60,
      paddingBottom: 40,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 20,
    },
    welcomeText: {
      fontSize: 28,
      color: colors.luminous,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.thin,
      textAlign: 'center',
    },
    formContainer: {
      backgroundColor: colors.luminous,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 25,
      paddingTop: 40,
      paddingBottom: 40,
      flex: 1,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.fondoClaro,
      borderRadius: 15,
      marginBottom: 20,
      paddingHorizontal: 15,
      height: 60,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    icon: {
      color: colors.variante8,
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: colors.default,
    },
    loginButton: {
      backgroundColor: colors.exito,
      paddingVertical: 15,
      borderRadius: 15,
      marginTop: 10,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    loginButtonText: {
      color: colors.luminous,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    registerText: {
      color: colors.thin,
      fontSize: 16,
    },
    registerLink: {
      color: colors.exito,
      fontSize: 16,
      fontWeight: 'bold',
    },
    errorMessage: {
      color: colors.error,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 15,
    },
})

export default LoginScreen