import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Image } from 'react-native';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ModalImagePicker = ({ visible, imageUri, onChooseImage, onTakePhoto, onSave, onCancel }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Cambiar Foto de Perfil</Text>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.imageButton} onPress={onChooseImage}>
              <Ionicons name="images-outline" size={24} color={colors.luminous} />
              <Text style={styles.imageButtonText}>Galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.imageButton} onPress={onTakePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.luminous} />
              <Text style={styles.imageButtonText}>Cámara</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={onSave}>
              <Text style={styles.modalButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.fondoClaro,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.default,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: colors.variante3,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  imageButtonText: {
    color: colors.luminous,
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: colors.variante3,
  },
  saveButton: {
    backgroundColor: colors.exito,
  },
  modalButtonText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
});

export default ModalImagePicker;