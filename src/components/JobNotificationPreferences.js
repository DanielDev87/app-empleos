import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { JobNotificationService } from '../services/JobNotificationService';

const JobNotificationPreferences = () => {
  const [enabled, setEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    keywords: '',
    location: '',
    employmentType: '',
    salary: '',
    experience: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await JobNotificationService.getNotificationPreferences();
      if (savedPreferences) {
        setPreferences(savedPreferences);
        setEnabled(true);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setIsLoading(false);
    }
  };

  const handleToggleNotifications = async (value) => {
    try {
      if (value) {
        const success = await JobNotificationService.saveNotificationPreferences(preferences);
        if (success) {
          await JobNotificationService.scheduleJobCheck(preferences);
          Alert.alert(
            'Notificaciones activadas',
            'Recibirás notificaciones cuando encontremos nuevos empleos que coincidan con tus preferencias.'
          );
        }
      } else {
        await JobNotificationService.saveNotificationPreferences(null);
        Alert.alert(
          'Notificaciones desactivadas',
          'Ya no recibirás notificaciones de nuevos empleos.'
        );
      }
      setEnabled(value);
    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert('Error', 'No se pudieron actualizar las preferencias de notificación.');
    }
  };

  const handleSavePreferences = async () => {
    try {
      const success = await JobNotificationService.saveNotificationPreferences(preferences);
      if (success) {
        Alert.alert('Éxito', 'Preferencias guardadas correctamente');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Cargando preferencias...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificaciones de Empleos</Text>
        <Switch
          value={enabled}
          onValueChange={handleToggleNotifications}
          trackColor={{ false: colors.thin, true: colors.principal }}
          thumbColor={colors.luminous}
        />
      </View>

      <View style={styles.preferencesContainer}>
        <Text style={styles.sectionTitle}>Preferencias de búsqueda</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color={colors.thin} />
          <TextInput
            style={styles.input}
            placeholder="Palabras clave (ej: desarrollador, diseñador)"
            value={preferences.keywords}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, keywords: text }))}
            editable={enabled}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color={colors.thin} />
          <TextInput
            style={styles.input}
            placeholder="Ubicación"
            value={preferences.location}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, location: text }))}
            editable={enabled}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="briefcase" size={20} color={colors.thin} />
          <TextInput
            style={styles.input}
            placeholder="Tipo de empleo (ej: tiempo completo, remoto)"
            value={preferences.employmentType}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, employmentType: text }))}
            editable={enabled}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="cash" size={20} color={colors.thin} />
          <TextInput
            style={styles.input}
            placeholder="Rango salarial"
            value={preferences.salary}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, salary: text }))}
            editable={enabled}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="school" size={20} color={colors.thin} />
          <TextInput
            style={styles.input}
            placeholder="Experiencia requerida"
            value={preferences.experience}
            onChangeText={(text) => setPreferences(prev => ({ ...prev, experience: text }))}
            editable={enabled}
          />
        </View>

        {enabled && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePreferences}
          >
            <Text style={styles.saveButtonText}>Guardar preferencias</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.luminous,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.delicate,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.default,
  },
  preferencesContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.default,
    marginBottom: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.delicate,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: colors.default,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: colors.principal,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default JobNotificationPreferences; 