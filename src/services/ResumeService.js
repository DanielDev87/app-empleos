import { db, storage } from './firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import ConnectivityService from './ConnectivityService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RESUME_CACHE_KEY = '@resume_cache_';

export const saveResume = async (userId, resumeData) => {
  try {
    if (!userId) {
      throw new Error('ID de usuario no proporcionado');
    }

    // Guardar en caché local primero
    await AsyncStorage.setItem(
      `${RESUME_CACHE_KEY}${userId}`,
      JSON.stringify({ ...resumeData, updatedAt: new Date().toISOString() })
    );

    // Verificar conectividad
    const isConnected = await ConnectivityService.checkConnectivity();
    if (!isConnected) {
      throw new Error('No hay conexión a Internet. Los cambios se guardarán cuando vuelva la conexión.');
    }

    const resumeRef = doc(db, 'resumes', userId);
    
    // Preparar los datos para guardar
    const dataToSave = {
      ...resumeData,
      updatedAt: serverTimestamp(),
    };

    // Si es la primera vez, agregar createdAt
    const docSnap = await getDoc(resumeRef);
    if (!docSnap.exists()) {
      dataToSave.createdAt = serverTimestamp();
    }

    // Guardar los datos básicos
    await setDoc(resumeRef, dataToSave, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error al guardar la hoja de vida:', error);
    throw new Error(`Error al guardar la hoja de vida: ${error.message}`);
  }
};

export const getResume = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Se requiere ID de usuario');
    }

    const resumeRef = doc(db, 'resumes', userId);
    
    try {
      // Intentar obtener datos con la red habilitada
      const docSnap = await getDoc(resumeRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: docSnap.data(),
          fromCache: docSnap.metadata.fromCache
        };
      } else {
        return {
          success: true,
          data: null,
          fromCache: false
        };
      }
    } catch (networkError) {
      console.log('Error de red, intentando obtener desde caché:', networkError);
      
      // Si falla, intentar deshabilitar la red y obtener de caché
      await disableNetwork(db);
      const offlineDocSnap = await getDoc(resumeRef);
      
      // Volver a habilitar la red después
      enableNetwork(db).catch(console.error);
      
      if (offlineDocSnap.exists()) {
        return {
          success: true,
          data: offlineDocSnap.data(),
          fromCache: true
        };
      } else {
        throw new Error('No hay datos disponibles en caché');
      }
    }
  } catch (error) {
    console.error('Error al obtener la hoja de vida:', error);
    throw new Error(`Error al obtener la hoja de vida: ${error.message}`);
  }
};

export const uploadAttachment = async (userId, file) => {
  try {
    if (!userId) {
      throw new Error('ID de usuario no proporcionado');
    }
    if (!file) {
      throw new Error('Archivo no proporcionado');
    }

    // Verificar conectividad
    const isConnected = await ConnectivityService.checkConnectivity();
    if (!isConnected) {
      throw new Error('No hay conexión a Internet. No se pueden subir archivos sin conexión.');
    }

    const timestamp = new Date().getTime();
    const fileName = `resumes/${userId}/attachments/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    // Subir el archivo
    const response = await fetch(file.uri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);

    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef);

    return {
      success: true,
      data: {
        name: file.name,
        url: downloadURL,
        path: fileName,
        type: file.type,
        uploadedAt: timestamp
      }
    };
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw new Error(`Error al subir el archivo: ${error.message}`);
  }
};

export const deleteAttachment = async (userId, filePath) => {
  try {
    if (!userId) {
      throw new Error('ID de usuario no proporcionado');
    }
    if (!filePath) {
      throw new Error('Ruta del archivo no proporcionada');
    }

    // Verificar conectividad
    const isConnected = await ConnectivityService.checkConnectivity();
    if (!isConnected) {
      throw new Error('No hay conexión a Internet. No se pueden eliminar archivos sin conexión.');
    }

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el archivo:', error);
    throw new Error(`Error al eliminar el archivo: ${error.message}`);
  }
}; 