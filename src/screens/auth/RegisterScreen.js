import React, {useState} from 'react'
import colors from '../../constants/colors';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebaseConfig'
import { LinearGradient } from 'expo-linear-gradient'
import { showMessage } from 'react-native-flash-message'

const RegisterScreen = ({navigation}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const validateInputs = () => {
        if (!name || !email || !confirmEmail || !password || !confirmPassword) {
            setError(true);
            setErrorMessage('Todos los campos son obligatorios');
            return false;
        }

        if (email !== confirmEmail) {
            setError(true);
            setErrorMessage('Los correos electrónicos no coinciden');
            return false;
        }

        if (password !== confirmPassword) {
            setError(true);
            setErrorMessage('Las contraseñas no coinciden');
            return false;
        }

        if (password.length < 6) {
            setError(true);
            setErrorMessage('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError(false);
        setErrorMessage('');

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: name
            });

            showMessage({
                message: '¡Registro exitoso!',
                description: 'Tu cuenta ha sido creada correctamente. Por favor, inicia sesión.',
                type: 'success',
            });

            navigation.navigate('Login');
        } catch (error) {
            setError(true);
            let message = 'Error en el registro. Por favor, intenta nuevamente.';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Este correo electrónico ya está registrado.';
                    break;
                case 'auth/invalid-email':
                    message = 'El correo electrónico no es válido.';
                    break;
                case 'auth/weak-password':
                    message = 'La contraseña debe tener al menos 6 caracteres.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Error de conexión. Verifica tu conexión a internet.';
                    break;
            }
            
            setErrorMessage(message);
            showMessage({
                message: 'Error en el registro',
                description: message,
                type: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

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
                        source={require('../../../assets/avatardanidev.png')}  
                        style={styles.logo}
                    />
                    <Text style={styles.welcomeText}>¡Únete a nosotros!</Text>
                    <Text style={styles.subtitle}>Crea tu cuenta para empezar</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Icon name="account-outline" size={24} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre completo"
                            placeholderTextColor={colors.thin}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!loading}
                        />
                    </View>

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
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="email-check-outline" size={24} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar correo electrónico"
                            placeholderTextColor={colors.thin}
                            value={confirmEmail}
                            onChangeText={setConfirmEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
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
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Icon name="lock-check-outline" size={24} style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar contraseña"
                            placeholderTextColor={colors.thin}
                            secureTextEntry
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    {error && (
                        <Text style={styles.errorMessage}>{errorMessage}</Text>
                    )}

                    <TouchableOpacity 
                        style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.luminous} />
                        ) : (
                            <Text style={styles.registerButtonText}>Crear cuenta</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Login')}
                            disabled={loading}
                        >
                            <Text style={styles.loginLink}>Iniciar sesión</Text>
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
    registerButton: {
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
    registerButtonDisabled: {
        opacity: 0.7,
    },
    registerButtonText: {
        color: colors.luminous,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    loginText: {
        color: colors.thin,
        fontSize: 16,
    },
    loginLink: {
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
});

export default RegisterScreen;