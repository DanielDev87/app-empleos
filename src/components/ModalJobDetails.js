import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ModalJobDetails = ({ visible, job, onClose }) => {
  const { user } = useAuth();

  const handleSaveJob = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para guardar empleos');
      return;
    }

    try {
      const savedJobsKey = `@savedJobs_${user.uid}`;
      const savedJobsData = await AsyncStorage.getItem(savedJobsKey);
      const savedJobs = savedJobsData ? JSON.parse(savedJobsData) : [];

      // Verificar si el empleo ya está guardado
      const isJobSaved = savedJobs.some(savedJob => savedJob.job_id === job.job_id);
      
      if (isJobSaved) {
        Alert.alert('Aviso', 'Este empleo ya está guardado');
        return;
      }

      // Agregar la fecha de guardado
      const jobWithDate = {
        ...job,
        savedAt: new Date().toISOString()
      };

      savedJobs.push(jobWithDate);
      await AsyncStorage.setItem(savedJobsKey, JSON.stringify(savedJobs));
      Alert.alert('Éxito', 'Empleo guardado correctamente');
    } catch (error) {
      console.error('Error al guardar el empleo:', error);
      Alert.alert('Error', 'No se pudo guardar el empleo');
    }
  };

  const handleApplyJob = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para aplicar a empleos');
      return;
    }

    try {
      const appliedJobsKey = `@appliedJobs_${user.uid}`;
      const appliedJobsData = await AsyncStorage.getItem(appliedJobsKey);
      const appliedJobs = appliedJobsData ? JSON.parse(appliedJobsData) : [];

      // Verificar si ya se aplicó al empleo
      const isJobApplied = appliedJobs.some(appliedJob => appliedJob.job_id === job.job_id);
      
      if (isJobApplied) {
        Alert.alert('Aviso', 'Ya has aplicado a este empleo');
        return;
      }

      // Agregar la fecha de aplicación
      const jobWithDate = {
        ...job,
        appliedAt: new Date().toISOString()
      };

      appliedJobs.push(jobWithDate);
      await AsyncStorage.setItem(appliedJobsKey, JSON.stringify(appliedJobs));
      
      // Abrir el enlace de aplicación si existe
      if (job.job_apply_link) {
        await Linking.openURL(job.job_apply_link);
      }
      
      Alert.alert('Éxito', 'Has aplicado al empleo correctamente');
    } catch (error) {
      console.error('Error al aplicar al empleo:', error);
      Alert.alert('Error', 'No se pudo aplicar al empleo');
    }
  };

  const handleShare = async () => {
    try {
      const shareMessage = `¡Mira esta oferta de trabajo!\n\n${job.job_title} en ${job.employer_name}\n\nMás detalles: ${job.job_apply_link || 'Enlace no disponible'}`;
      
      await Share.share({
        message: shareMessage,
        title: `Oferta de trabajo: ${job.job_title}`,
      });
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir el empleo');
    }
  };

  if (!job) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.thin} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              {job.employer_logo ? (
                <Image
                  source={{ uri: job.employer_logo }}
                  style={styles.companyLogo}
                  defaultSource={require('../../assets/default-company.png')}
                />
              ) : (
                <View style={[styles.companyLogo, styles.placeholderLogo]}>
                  <Ionicons name="business" size={30} color={colors.thin} />
                </View>
              )}
              <Text style={styles.jobTitle}>{job.job_title}</Text>
              <Text style={styles.companyName}>{job.employer_name}</Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Ionicons name="location" size={20} color={colors.principal} />
                <Text style={styles.detailText}>
                  {job.job_country || 'Ubicación no especificada'}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color={colors.principal} />
                <Text style={styles.detailText}>
                  {job.job_employment_type || 'Tipo no especificado'}
                </Text>
              </View>

              {job.job_salary && (
                <View style={styles.detailItem}>
                  <Ionicons name="cash" size={20} color={colors.principal} />
                  <Text style={styles.detailText}>{job.job_salary}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{job.job_description}</Text>
            </View>

            {job.job_highlights?.qualifications && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Requisitos</Text>
                {job.job_highlights.qualifications.map((qualification, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{qualification}</Text>
                  </View>
                ))}
              </View>
            )}

            {job.job_highlights?.benefits && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Beneficios</Text>
                {job.job_highlights.benefits.map((benefit, index) => (
                  <View key={index} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.shareButton]}
              onPress={handleShare}
            >
              <Ionicons name="share-social" size={20} color={colors.luminous} />
              <Text style={styles.buttonText}>Compartir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSaveJob}
            >
              <Ionicons name="bookmark" size={20} color={colors.luminous} />
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApplyJob}
            >
              <Ionicons name="paper-plane" size={20} color={colors.luminous} />
              <Text style={styles.buttonText}>Aplicar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.luminous,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '90%',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  placeholderLogo: {
    backgroundColor: colors.delicate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.default,
    textAlign: 'center',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 16,
    color: colors.thin,
    marginBottom: 15,
  },
  detailsContainer: {
    backgroundColor: colors.fondoClaro,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.thin,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.thin,
    lineHeight: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 10,
  },
  bullet: {
    fontSize: 16,
    color: colors.principal,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.thin,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: colors.delicate,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: colors.principal,
  },
  saveButton: {
    backgroundColor: colors.variante8,
  },
  applyButton: {
    backgroundColor: colors.exito,
  },
  buttonText: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ModalJobDetails;
