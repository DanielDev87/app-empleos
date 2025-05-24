import { storage, auth } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';

export const uploadFile = async (userId, file) => {
  try {
    console.log('Iniciando subida de archivo:', { userId, file });
    
    if (!userId || !file) {
      throw new Error('Se requiere ID de usuario y archivo');
    }

    // Verificar que storage esté inicializado
    if (!storage) {
      throw new Error('Firebase Storage no está inicializado correctamente');
    }

    // Obtener la extensión del archivo
    const fileExtension = file.name.split('.').pop().toLowerCase();
    console.log('Extensión del archivo:', fileExtension);
    
    // Verificar tipo de archivo permitido
    const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    if (!allowedTypes.includes(fileExtension)) {
      throw new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC, DOCX, JPG y PNG');
    }

    // Crear un nombre único para el archivo
    const timestamp = new Date().getTime();
    const fileName = `resumes/${userId}/attachments/${timestamp}_${file.name}`;
    console.log('Nombre del archivo en Storage:', fileName);
    
    const storageRef = ref(storage, fileName);
    console.log('Storage reference creada');

    // Verificar el archivo
    console.log('Información del archivo:', {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
      size: file.size
    });

    // Leer el archivo
    console.log('Leyendo archivo...');
    const fileContent = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Convertir base64 a array de bytes
    const byteArray = Buffer.from(fileContent, 'base64');
    console.log('Archivo convertido a bytes, tamaño:', byteArray.length);

    // Subir el archivo
    console.log('Iniciando subida a Firebase Storage...');
    const metadata = {
      contentType: file.mimeType || `application/${fileExtension}`
    };

    const snapshot = await uploadBytes(storageRef, byteArray, metadata);
    console.log('Archivo subido exitosamente, metadata:', snapshot.metadata);
    
    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('URL de descarga obtenida:', downloadURL);

    const result = {
      success: true,
      data: {
        name: file.name,
        url: downloadURL,
        path: fileName,
        type: file.mimeType || `application/${fileExtension}`,
        size: byteArray.length,
        uploadedAt: timestamp
      }
    };

    console.log('Subida completada:', result);
    return result;

  } catch (error) {
    console.error('Error detallado al subir archivo:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      name: error.name
    });
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
};

export const deleteFile = async (userId, filePath) => {
  try {
    if (!userId || !filePath) {
      throw new Error('Se requiere ID de usuario y ruta del archivo');
    }

    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    throw new Error(`Error al eliminar archivo: ${error.message}`);
  }
};

export const downloadFile = async (url, filename) => {
  try {
    // Crear el directorio de descargas si no existe
    const downloadDir = FileSystem.documentDirectory + 'downloads/';
    const dirInfo = await FileSystem.getInfoAsync(downloadDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });
    }

    const downloadPath = `${downloadDir}${filename}`;
    
    // Descargar el archivo
    const { uri } = await FileSystem.downloadAsync(url, downloadPath);
    
    return {
      success: true,
      uri: uri
    };
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw new Error(`Error al descargar archivo: ${error.message}`);
  }
}; 