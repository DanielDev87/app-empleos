import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationScreen from '../src/screens/NotificationScreen';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Mock the dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({
    remove: jest.fn()
  }))
}));

jest.mock('expo-constants', () => ({
  appOwnership: 'standalone',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }) => children,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock colors constant
jest.mock('../src/constants/colors', () => ({
  thin: '#999',
  error: '#FF0000',
  principal: '#000',
  default: '#000',
  luminous: '#FFF',
  delicate: '#666',
  fondoClaro: '#FFF',
  gradienteSecundario: ['#000', '#000'],
}));

describe('NotificationScreen Component', () => {
  let mockNotifications;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockNotifications = [
      {
        id: '1',
        title: 'Test Notification',
        message: 'This is a test notification',
        time: '2 min ago',
        read: false,
      },
    ];
  });

  it('renders empty state when there are no notifications', () => {
    const { getByText } = render(<NotificationScreen />);
    expect(getByText('No hay notificaciones')).toBeTruthy();
    expect(
      getByText('Las notificaciones sobre nuevos empleos y actualizaciones aparecerán aquí')
    ).toBeTruthy();
  });

  it('does not show Expo Go warning in standalone mode', () => {
    const { queryByText } = render(<NotificationScreen />);
    expect(
      queryByText('Las notificaciones no están disponibles en Expo Go')
    ).toBeNull();
  });

  it('renders notification items correctly', () => {
    // Create a component wrapper that provides the notifications state
    const TestComponent = () => {
      const [notifications, setNotifications] = React.useState(mockNotifications);
      return <NotificationScreen testNotifications={notifications} />;
    };

    const { getByText } = render(<TestComponent />);
    expect(getByText('Notificaciones')).toBeTruthy();
  });

  it('sets up notification listener on mount', () => {
    const mockRemove = jest.fn();
    const mockListener = jest.fn(() => ({
      remove: mockRemove
    }));
    
    Notifications.addNotificationReceivedListener.mockImplementation(mockListener);

    const { unmount } = render(<NotificationScreen />);
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });
}); 