import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import { db } from './firebaseConfig';

class ConnectivityService {
  static isConnected = true;
  static listeners = new Set();

  static async init() {
    // Suscribirse a cambios de conectividad
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected;

      if (wasConnected !== this.isConnected) {
        this.handleConnectionChange(this.isConnected);
      }
    });

    // Verificar estado inicial
    const state = await NetInfo.fetch();
    this.isConnected = state.isConnected;
    return this.isConnected;
  }

  static async handleConnectionChange(isConnected) {
    try {
      if (isConnected) {
        await enableNetwork(db);
      } else {
        await disableNetwork(db);
      }
      
      // Notificar a los listeners
      this.listeners.forEach(listener => listener(isConnected));
    } catch (error) {
      console.error('Error handling connectivity change:', error);
    }
  }

  static addListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  static async checkConnectivity() {
    try {
      const state = await NetInfo.fetch();
      this.isConnected = state.isConnected;
      return this.isConnected;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }
}

export default ConnectivityService; 