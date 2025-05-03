import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import colors from '../constants/colors';

const ModalJobDetails = ({ visible, job, onClose }) => {
  if (!job) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView style={styles.scroll}>
            <Text style={styles.title}>{job.job_title}</Text>
            <Text style={styles.company}>{job.employer_name}</Text>

            <Text style={styles.label}>Ubicación</Text>
            <Text style={styles.info}>{job.job_city}, {job.job_country}</Text>

            <Text style={styles.label}>Tipo de empleo</Text>
            <Text style={styles.info}>{job.job_employment_type}</Text>

            <Text style={styles.label}>Publicado</Text>
            <Text style={styles.info}>{new Date(job.job_posted_at_datetime_utc).toLocaleDateString()}</Text>

            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.description}>{job.job_description}</Text>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={() => console.log('Guardar')}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.apply]} onPress={() => console.log('Aplicar')}>
              <Text style={styles.buttonText}>Aplicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.share]} onPress={() => console.log('Compartir')}>
              <Text style={styles.buttonText}>Compartir</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: colors.fondoClaro,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 4,
  },
  company: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    marginTop: 10,
    color: '#999',
  },
  info: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 15,
    marginTop: 5,
    color: '#444',
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: 'center',
  },
  save: {
    backgroundColor: '#f0ad4e',
  },
  apply: {
    backgroundColor: '#28a745',
  },
  share: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
  },
  closeButtonText: {
    color: colors.cancelar,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ModalJobDetails;
