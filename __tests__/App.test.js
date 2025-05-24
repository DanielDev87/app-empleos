import React from 'react';
import { render, act } from '@testing-library/react-native';
import App from '../App';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Mock the dependencies
jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn(() => ({
    remove: jest.fn()
  }))
}));

jest.mock('expo-constants', () => ({
  executionEnvironment: 'standalone',
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

jest.mock('../src/navigation/AppNavigator', () => 'AppNavigator');
jest.mock('react-native-flash-message', () => 'FlashMessage');
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
}));

// Mock the notification service
const mockRegisterForPushNotifications = jest.fn();
jest.mock('../src/services/NotificationService', () => ({
  registerForPushNotificationsAsync: () => mockRegisterForPushNotifications(),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRegisterForPushNotifications.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading screen initially', () => {
    const { getByText } = render(<App />);
    expect(getByText('Inicializando aplicación...')).toBeTruthy();
  });

  it('initializes notifications when not in Expo Go', async () => {
    mockRegisterForPushNotifications.mockResolvedValueOnce('mock-token');
    
    const { unmount } = render(<App />);
    
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(mockRegisterForPushNotifications).toHaveBeenCalled();
    unmount();
  });

  it('handles notification initialization errors gracefully', async () => {
    const mockError = new Error('Test error');
    mockRegisterForPushNotifications.mockRejectedValueOnce(mockError);
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    const { unmount } = render(<App />);
    
    await act(async () => {
      await jest.runAllTimersAsync();
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Error al inicializar notificaciones:',
      mockError
    );

    consoleLogSpy.mockRestore();
    unmount();
  });
}); 