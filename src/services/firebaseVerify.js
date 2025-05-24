import { db, auth } from './firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

export const verifyFirebaseConnection = async () => {
  try {
    // 1. Verificar autenticación
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No hay usuario autenticado');
    }

    // 2. Verificar configuración básica
    if (!db?.app?.options?.projectId) {
      throw new Error('Configuración de Firebase incompleta');
    }

    // 3. Verificar conexión a Firestore con prueba de escritura/lectura
    const testCollection = collection(db, '_test_connection');
    const testData = {
      timestamp: new Date(),
      userId: currentUser.uid,
      test: true
    };

    // Intentar escribir
    const docRef = await addDoc(testCollection, testData);
    
    // Intentar leer
    const docSnap = await getDocs(testCollection);
    
    // Limpiar después de la prueba
    await deleteDoc(docRef);

    return {
      success: true,
      message: 'Conexión exitosa a Firebase',
      config: {
        projectId: db.app.options.projectId,
        authDomain: db.app.options.authDomain,
        uid: currentUser.uid,
        email: currentUser.email
      }
    };
  } catch (error) {
    console.error('Error de verificación de Firebase:', error);
    
    // Determinar el tipo de error
    let errorMessage = 'Error desconocido';
    if (error.code === 'permission-denied') {
      errorMessage = 'Error de permisos en Firestore. Verifica las reglas de seguridad.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'No hay conexión a Internet o el servicio no está disponible.';
    } else if (error.code === 'not-found') {
      errorMessage = 'La base de datos no existe. Verifica la configuración del proyecto.';
    } else {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      code: error.code,
      config: {
        projectId: db?.app?.options?.projectId,
        authDomain: db?.app?.options?.authDomain,
        uid: currentUser?.uid,
        email: currentUser?.email
      }
    };
  }
}; 