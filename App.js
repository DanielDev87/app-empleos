import React, { useEffect, useState } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationProvider } from './src/context/NotificationContext';
import FlashMessage from 'react-native-flash-message';
import { registerForPushNotificationsAsync } from './src/services/NotificationService'; 
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, Text } from 'react-native';
import Constants from 'expo-constants';
import { JobNotificationService } from './src/services/JobNotificationService';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={{ marginTop: 10, fontSize: 16 }}>Inicializando aplicación...</Text>
    </View>
  );
}

// Configurar el manejador de notificaciones en segundo plano
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [expoPushToken, setExpoPushToken] = useState(null);
  const notificationListener = React.useRef();
  const responseListener = React.useRef();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Solo intentar configurar notificaciones si no estamos en Expo Go
        if (Constants.executionEnvironment !== 'storeClient') {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            setExpoPushToken(token);
            
            // Configurar el listener para notificaciones recibidas
            notificationListener.current = Notifications.addNotificationReceivedListener(
              async notification => {
                // Si es una notificación de verificación de empleos, buscar nuevos empleos
                if (notification.request.content.data?.type === 'job_check') {
                  const preferences = await JobNotificationService.getNotificationPreferences();
                  if (preferences) {
                    const newJobs = await JobNotificationService.checkForNewJobs(
                      preferences.keywords,
                      {
                        location: preferences.location,
                        employment_type: preferences.employmentType,
                        salary: preferences.salary,
                        experience: preferences.experience,
                      }
                    );

                    // Enviar notificación por cada nuevo empleo encontrado
                    for (const job of newJobs) {
                      await JobNotificationService.sendNewJobNotification(job);
                    }
                  }
                }
              }
            );
            
            // Configurar el listener para respuestas a notificaciones
            responseListener.current = Notifications.addNotificationResponseReceivedListener(
              response => {
                const jobId = response.notification.request.content.data?.jobId;
                if (jobId) {
                  // Aquí puedes agregar la lógica para navegar a los detalles del empleo
                  // cuando el usuario toca la notificación
                }
              }
            );
          }
        }
      } catch (error) {
        console.error('Error al inicializar notificaciones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <NotificationProvider>
        <NavigationContainer>
          <AppNavigator />
          <FlashMessage position="top" />
        </NavigationContainer>
      </NotificationProvider>
    </AuthProvider>
  );
}