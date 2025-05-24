import { db, auth, app } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const debugFirebaseConfig = async () => {
  try {
    // 1. Verificar inicialización de Firebase
    console.log('=== Diagnóstico de Firebase ===');
    console.log('App inicializada:', !!app);
    console.log('Configuración:', {
      projectId: app?.options?.projectId,
      authDomain: app?.options?.authDomain,
      storageBucket: app?.options?.storageBucket
    });

    // 2. Verificar estado de autenticación
    console.log('\n=== Estado de Autenticación ===');
    console.log('Auth inicializado:', !!auth);
    console.log('Usuario actual:', auth?.currentUser?.email || 'No autenticado');
    console.log('UID:', auth?.currentUser?.uid || 'N/A');

    // 3. Verificar Firestore
    console.log('\n=== Estado de Firestore ===');
    console.log('Firestore inicializado:', !!db);
    
    // 4. Intentar una operación simple de lectura
    if (db) {
      try {
        const testQuery = await getDocs(collection(db, 'resumes'));
        console.log('Prueba de lectura exitosa:', !testQuery.empty);
        console.log('Documentos encontrados:', testQuery.size);
      } catch (error) {
        console.log('Error en prueba de lectura:', error.code, error.message);
      }
    }

    // 5. Verificar persistencia
    console.log('\n=== Configuración de Persistencia ===');
    const persistence = getReactNativePersistence(AsyncStorage);
    console.log('Persistencia configurada:', !!persistence);

    return {
      success: true,
      message: 'Diagnóstico completado'
    };
  } catch (error) {
    console.error('Error durante el diagnóstico:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 