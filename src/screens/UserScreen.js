import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Button, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { showMessage } from 'react-native-flash-message';

const UserScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false); // Estado para el modal de confirmación
  const [imageUri, setImageUri] = useState(null)
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

  useEffect(() => {
    if (user && user.photoURL) {
      setImageUri(user.photoURL)
    } else {
      setImageUri(defaultImage)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra la sesión con Firebase
      showMessage({
        message: '👋',
        description: 'Has cerrado sesión correctamente.',
        type: 'success',
      });
      setLogoutModalVisible(false); // Cierra el modal
      navigation.navigate('Login'); // Navega a la pantalla de inicio de sesión
    } catch (error) {
      showMessage({
        message: '😵‍💫',
        description: 'No se pudo cerrar sesión. Inténtalo de nuevo.',
        type: 'danger',
      });
    }
  };

  return (
    <LinearGradient colors={colors.gradienteAccion} style={styles.container}>
      <View style={styles.info}>
          <Text style={styles.label}>Foto de perfil</Text>
          <Image source={{ uri: imageUri || defaultImage }} style={styles.profileImage} />
      </View>
      <View style={styles.header}>
        <Text style={styles.title}>{user?.displayName || 'Usuario'}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.editButton}>Ajustes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)} // Abre el modal de confirmación
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de confirmación para cerrar sesión */}
      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Estás seguro de que deseas cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <Button title="Cancelar" onPress={() => setLogoutModalVisible(false)} />
              <Button title="Cerrar sesión" onPress={handleLogout} />
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: colors.luminous,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  editButton: {
    fontSize: 16,
    color: colors.variante8,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: colors.variante2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoutButton: {
    backgroundColor: '#A72C2A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default UserScreen;