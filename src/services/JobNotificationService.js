import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const NOTIFICATION_PREFERENCES_KEY = '@jobNotificationPreferences';
const LAST_CHECK_TIME_KEY = '@lastJobCheckTime';

export class JobNotificationService {
  static async saveNotificationPreferences(preferences) {
    try {
      await AsyncStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
  }

  static async getNotificationPreferences() {
    try {
      const preferences = await AsyncStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return null;
    }
  }

  static async checkForNewJobs(searchQuery, filters = {}) {
    try {
      // Construir los parámetros de búsqueda
      const searchParams = new URLSearchParams({
        query: searchQuery.trim(),
        page: '1',
        num_pages: '1',
        ...filters
      });

      const response = await fetch(`https://jsearch.p.rapidapi.com/search?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': '95fad8dd19mshfab31dbe0960749p1c436djsn9399bef73fb9',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      });

      const data = await response.json();
      
      if (!response.ok || !data.data) {
        throw new Error(data.message || 'Error fetching jobs');
      }

      const lastCheckTime = await AsyncStorage.getItem(LAST_CHECK_TIME_KEY);
      const lastCheck = lastCheckTime ? new Date(JSON.parse(lastCheckTime)) : new Date(0);
      
      // Filtrar trabajos nuevos basados en la última verificación
      const newJobs = data.data.filter(job => {
        const jobDate = new Date(job.job_posted_at_timestamp * 1000);
        return jobDate > lastCheck;
      });

      // Actualizar tiempo de última verificación
      await AsyncStorage.setItem(LAST_CHECK_TIME_KEY, JSON.stringify(new Date()));

      return newJobs;
    } catch (error) {
      console.error('Error checking for new jobs:', error);
      return [];
    }
  }

  static async scheduleJobCheck(preferences) {
    try {
      // Actualizar el manejador de notificaciones con las nuevas propiedades
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      // Programar la verificación periódica
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Buscando nuevos empleos",
          body: "Verificando nuevas oportunidades laborales...",
          data: { type: 'job_check' },
        },
        trigger: {
          seconds: 3600, // Verificar cada hora
          repeats: true,
        },
      });

      return true;
    } catch (error) {
      console.error('Error scheduling job check:', error);
      return false;
    }
  }

  static async sendNewJobNotification(job) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Nuevo empleo encontrado!",
          body: `${job.job_title} en ${job.employer_name}`,
          data: { jobId: job.job_id },
        },
        trigger: null, // Enviar inmediatamente
      });
    } catch (error) {
      console.error('Error sending job notification:', error);
    }
  }
} 