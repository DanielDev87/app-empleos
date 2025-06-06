import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import colors from '../constants/colors';
import Constants from 'expo-constants';
import JobNotificationPreferences from '../components/JobNotificationPreferences';
import { useNotifications } from '../context/NotificationContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NotificationScreen = () => {
  const { notifications, clearNotifications, markAsRead, markAllAsRead, addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Animación para el estado vacío
  const emptyStateAnimation = new Animated.Value(0);

  useEffect(() => {
    // Animar el estado vacío
    Animated.loop(
      Animated.sequence([
        Animated.timing(emptyStateAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(emptyStateAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const handleAddTestNotification = () => {
    addNotification({
      title: "Nuevo empleo encontrado",
      body: "Desarrollador React Native - Empresa XYZ",
      icon: "briefcase",
      data: {
        jobId: "test-job-" + Date.now(),
        type: "job"
      }
    });
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Animated.View
        style={[
          styles.emptyIconContainer,
          {
            transform: [
              {
                translateY: emptyStateAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons
          name="notifications-off-outline"
          size={80}
          color={colors.thin}
        />
      </Animated.View>
      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
      <Text style={styles.emptyText}>
        Las notificaciones sobre nuevos empleos y actualizaciones aparecerán aquí
      </Text>
      <TouchableOpacity
        style={styles.testButton}
        onPress={handleAddTestNotification}
      >
        <Text style={styles.testButtonText}>Agregar notificación de prueba</Text>
      </TouchableOpacity>
      {Constants.executionEnvironment === 'storeClient' && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color={colors.error} />
          <Text style={styles.warningText}>
            Las notificaciones no están disponibles en Expo Go
          </Text>
        </View>
      )}
    </View>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotificationItem
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons
          name={item.icon || "notifications-outline"}
          size={24}
          color={colors.principal}
        />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.body || item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.gradienteSecundario} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.preferencesButton}
            onPress={() => setShowPreferences(!showPreferences)}
          >
            <Ionicons name="options" size={24} color={colors.luminous} />
          </TouchableOpacity>
          {notifications.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.markReadButton}
                onPress={markAllAsRead}
              >
                <Ionicons name="checkmark-done" size={24} color={colors.luminous} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearNotifications}
              >
                <Text style={styles.clearButtonText}>Limpiar todo</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleAddTestNotification}
          >
            <Ionicons name="add-circle" size={24} color={colors.luminous} />
          </TouchableOpacity>
          <Image 
            source={require('../../assets/avatardanidev.png')} 
            style={styles.avatarLogo}
          />
        </View>
      </View>

      {showPreferences ? (
        <JobNotificationPreferences />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item, index) => item.id || `notification-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  preferencesButton: {
    padding: 8,
  },
  clearButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  clearButtonText: {
    color: colors.luminous,
    fontSize: 14,
    fontWeight: '500',
  },
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  listContainer: {
    flexGrow: 1,
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: colors.thin,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  warningText: {
    marginLeft: 8,
    color: colors.error,
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: colors.luminous,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: colors.default,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.principal + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.thin,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: colors.delicate,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.principal,
    marginLeft: 10,
  },
  unreadNotificationItem: {
    backgroundColor: `${colors.principal}10`,
  },
  markReadButton: {
    padding: 8,
  },
  testButton: {
    backgroundColor: colors.principal,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 15,
  },
  testButtonText: {
    color: colors.luminous,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationScreen;