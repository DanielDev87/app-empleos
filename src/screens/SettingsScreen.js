import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebaseConfig';
import { updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import colors from '../constants/colors';
import { showMessage } from 'react-native-flash-message';
import ModalEditProfile from '../components/ModalEditProfile';
import ModalImagePicker from '../components/ModalImagePicker';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

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
      console.error('Error seleccionando la imagen:', error);
      showMessage({
        message: 'Error',
        description: 'Ocurrió un error al intentar seleccionar la imagen.',
        type: 'danger',
      });
    }
  };

  const uploadImage = async () => {
    if (!user || !imageUri) {
      console.error('Usuario o URI de imagen no válidos:', { user, imageUri });
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
      console.error('Error subiendo la imagen:', error);
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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Volver</Text>
      </TouchableOpacity>
      <Text style={styles.subtitle}>Ajustes</Text>
      <Text style={styles.sectionTitle}>Sobre tu cuenta</Text>

      {/* Foto de perfil */}
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Foto de perfil</Text>
          <Image source={{ uri: imageUri || defaultImage }} style={styles.profileImage} />
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setImageModalVisible(true)}
        >
          <Text style={styles.editText}>Cambiar</Text>
        </TouchableOpacity>
      </View>

      {/* Nombre */}
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Nombre</Text>
          <Text style={styles.infoText}>{user?.displayName || 'Sin nombre'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit('Nombre')}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Correo */}
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>Correo electrónico</Text>
          <Text style={styles.infoText}>{user?.email || 'Sin correo'}</Text>
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit('Correo')}
        >
          <Text style={styles.editText}>Editar</Text>
        </TouchableOpacity>
      </View>

      <ModalEditProfile
        visible={isEditModalVisible}
        title={modalTitle}
        value={fieldValue}
        onChangeText={setFieldValue}
        onSave={handleSave}
        onCancel={() => setEditModalVisible(false)}
      />

      <ModalImagePicker
        visible={isImageModalVisible}
        imageUri={imageUri}
        onChooseImage={handleChooseImage}
        onSave={uploadImage}
        onCancel={() => setImageModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.variante6,
  },
  subtitle: {
    fontSize: 24,
    color: colors.luminous,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.luminous,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: colors.luminous,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 16,
    color: colors.variante2,
  },
  editButton: {
    backgroundColor: colors.variante8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  backButton: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;