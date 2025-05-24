import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { showMessage } from 'react-native-flash-message';
import { Ionicons } from '@expo/vector-icons';

const UserScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  useEffect(() => {
    if (user && user.photoURL) {
      setImageUri(user.photoURL);
    } else {
      setImageUri(defaultImage);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showMessage({
        message: '👋',
        description: 'Has cerrado sesión correctamente.',
        type: 'success',
      });
      setLogoutModalVisible(false);
      navigation.navigate('Login');
    } catch (error) {
      showMessage({
        message: '😵‍💫',
        description: 'No se pudo cerrar sesión. Inténtalo de nuevo.',
        type: 'danger',
      });
    }
  };

  const menuItems = [
    {
      icon: 'document-text',
      title: 'Mi Hoja de Vida',
      onPress: () => navigation.navigate('Resume'),
      color: colors.principal
    },
    {
      icon: 'briefcase',
      title: 'Mis Empleos',
      onPress: () => navigation.navigate('ProfileStack', { screen: 'MyJobs' }),
      color: colors.variante8
    },
    {
      icon: 'settings',
      title: 'Ajustes',
      onPress: () => navigation.navigate('Settings'),
      color: colors.variante8
    },
    {
      icon: 'information-circle',
      title: 'Acerca de',
      onPress: () => navigation.navigate('About'),
      color: colors.variante5
    },
    {
      icon: 'log-out',
      title: 'Cerrar Sesión',
      onPress: () => setLogoutModalVisible(true),
      color: colors.error
    }
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient colors={colors.gradienteSecundario} style={styles.container}>
        <View style={styles.profileSection}>
          <Image source={{ uri: imageUri || defaultImage }} style={styles.profileImage} />
          <Text style={styles.userName}>{user?.displayName || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon} size={24} color={colors.luminous} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={24} color={colors.thin} />
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalText}>¿Estás seguro de que deseas cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.logoutModalButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutModalButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
  },
  container: {
    minHeight: '100%',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.luminous,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    color: colors.luminous,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: colors.variante5,
  },
  menuContainer: {
    backgroundColor: colors.fondoClaro,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.luminous,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: colors.default,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.luminous,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: colors.thin,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.fondoClaro,
  },
  logoutModalButton: {
    backgroundColor: colors.error,
  },
  cancelButtonText: {
    color: colors.default,
    fontWeight: 'bold',
  },
  logoutModalButtonText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
});

export default UserScreen;