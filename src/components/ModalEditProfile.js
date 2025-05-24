import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const ModalEditProfile = ({ visible, title, value, onChangeText, onSave, onCancel, isPassword = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onCancel}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder={`${isPassword ? 'Nueva contraseña' : 'Nuevo ' + title.toLowerCase()}`}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={isPassword && !showPassword}
              autoCapitalize={isPassword ? 'none' : 'sentences'}
              autoCorrect={!isPassword}
            />
            {isPassword && (
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color={colors.thin}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]} 
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.saveButton]} 
              onPress={onSave}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
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
    width: '90%',
    backgroundColor: colors.fondoClaro,
    borderRadius: 15,
    padding: 20,
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.default,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    height: 50,
    backgroundColor: colors.luminous,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.default,
    borderWidth: 1,
    borderColor: colors.delicate,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
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
    backgroundColor: colors.variante3,
  },
  saveButton: {
    backgroundColor: colors.exito,
  },
  cancelButtonText: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ModalEditProfile;