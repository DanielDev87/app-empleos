import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import colors from '../constants/colors';
import { showMessage } from 'react-native-flash-message';
import ModalEditProfile from '../components/ModalEditProfile';
import ModalImagePicker from '../components/ModalImagePicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dnjpuudn1/image/upload';
const UPLOAD_PRESET = 'IMAGEDANIEL';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const [imageUri, setImageUri] = useState(null);
  const defaultImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  useEffect(() => {
    if (user && user.photoURL) {
      setImageUri(user.photoURL);
    } else {
      setImageUri(defaultImage);
    }
  }, [user]);

  const handleChooseImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        showMessage({
          message: 'Permiso denegado',
          description: 'Se necesita permiso para acceder a la galería.',
          type: 'danger',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) {
        showMessage({
          message: 'Cancelado',
          description: 'No se seleccionó ninguna imagen.',
          type: 'info',
        });
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Ocurrió un error al intentar seleccionar la imagen.',
        type: 'danger',
      });
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        showMessage({
          message: 'Permiso denegado',
          description: 'Se necesita permiso para acceder a la cámara.',
          type: 'danger',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) {
        showMessage({
          message: 'Cancelado',
          description: 'No se tomó ninguna foto.',
          type: 'info',
        });
        return;
      }

      setImageUri(result.assets[0].uri);
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'Ocurrió un error al intentar tomar la foto.',
        type: 'danger',
      });
    }
  };

  const uploadImage = async () => {
    if (!user || !imageUri) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
      formData.append('upload_preset', UPLOAD_PRESET);

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        await updateProfile(auth.currentUser, { photoURL: data.secure_url });
        setUser({ ...user, photoURL: data.secure_url });
        setImageUri(data.secure_url);
        showMessage({
          message: 'Éxito',
          description: 'Foto de perfil actualizada correctamente.',
          type: 'success',
        });
      } else {
        throw new Error(data.error?.message || 'No se pudo obtener la URL de la imagen subida');
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setImageModalVisible(false);
    }
  };

  const handleEdit = (field) => {
    setModalTitle(field);
    setFieldValue(
      field === 'Nombre'
        ? user?.displayName || ''
        : field === 'Correo'
        ? user?.email || ''
        : ''
    );
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (modalTitle === 'Nombre') {
        await updateProfile(auth.currentUser, { displayName: fieldValue });
        setUser({ ...user, displayName: fieldValue });
        showMessage({
          message: 'Éxito',
          description: 'Nombre actualizado correctamente.',
          type: 'success',
        });
      } else if (modalTitle === 'Correo') {
        await updateEmail(auth.currentUser, fieldValue);
        setUser({ ...user, email: fieldValue });
        showMessage({
          message: 'Éxito',
          description: 'Correo actualizado correctamente.',
          type: 'success',
        });
      } else if (modalTitle === 'Contraseña') {
        await updatePassword(auth.currentUser, fieldValue);
        showMessage({
          message: 'Éxito',
          description: 'Contraseña actualizada correctamente.',
          type: 'success',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setEditModalVisible(false);
    }
  };

  return (
    <LinearGradient 
      colors={[colors.variante2, colors.variante5]} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.luminous} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <Image 
          source={require('../../assets/avatardanidev.png')} 
          style={styles.avatarLogo}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri || defaultImage }} 
              style={styles.profileImage} 
            />
            <TouchableOpacity
              style={styles.editImageButton}
              onPress={() => setImageModalVisible(true)}
            >
              <Ionicons name="camera" size={20} color={colors.luminous} />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.displayName || 'Sin nombre'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'Sin correo'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Nombre</Text>
              <Text style={styles.settingValue}>{user?.displayName || 'Sin nombre'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit('Nombre')}
            >
              <Text style={styles.editButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Correo electrónico</Text>
              <Text style={styles.settingValue}>{user?.email || 'Sin correo'}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit('Correo')}
            >
              <Text style={styles.editButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Contraseña</Text>
              <Text style={styles.settingValue}>••••••••</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit('Contraseña')}
            >
              <Text style={styles.editButtonText}>Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ModalEditProfile
        visible={isEditModalVisible}
        title={modalTitle}
        value={fieldValue}
        onChangeText={setFieldValue}
        onSave={handleSave}
        onCancel={() => setEditModalVisible(false)}
        isPassword={modalTitle === 'Contraseña'}
      />

      <ModalImagePicker
        visible={isImageModalVisible}
        imageUri={imageUri}
        onChooseImage={handleChooseImage}
        onTakePhoto={handleTakePhoto}
        onSave={uploadImage}
        onCancel={() => setImageModalVisible(false)}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.luminous,
  },
  backButton: {
    padding: 10,
  },
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    backgroundColor: colors.luminous,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.delicate,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.variante8,
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.variante8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.luminous,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.thin,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
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
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.thin,
    marginBottom: 4,
  },
  settingValue: {
    fontSize: 16,
    color: colors.default,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: colors.variante8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  editButtonText: {
    color: colors.luminous,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;