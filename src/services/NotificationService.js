import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import colors from '../constants/colors';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const registerForPushNotificationsAsync = async () => {
  if (Constants.appOwnership === 'expo') {
    return null;
  }

  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    return token;
  } catch (error) {
    return null;
  }
};