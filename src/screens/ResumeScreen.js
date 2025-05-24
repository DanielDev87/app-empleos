import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { saveResume, getResume, uploadAttachment, deleteAttachment } from '../services/ResumeService';
import { showMessage } from 'react-native-flash-message';
import ConnectivityService from '../services/ConnectivityService';
import { verifyFirebaseConnection } from '../services/firebaseVerify';
import { debugFirebaseConfig } from '../services/firebaseDebug';
import { uploadFile, deleteFile, downloadFile } from '../services/StorageService';

const ResumeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  const [formData, setFormData] = useState({
    personalInfo: {
      fullName: '',
      phone: '',
      address: '',
      birthDate: '',
      profession: '',
      summary: ''
    },
    education: [],
    experience: [],
    skills: [],
    languages: [],
    attachments: []
  });

  const [currentSection, setCurrentSection] = useState('personal');

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setConnectionError(null);

        if (!user || !user.uid) {
          throw new Error('No hay usuario autenticado');
        }

        // Intentar cargar datos
        const maxRetries = 3;
        let lastError = null;
        
        for (let i = 0; i < maxRetries; i++) {
          try {
            const result = await getResume(user.uid);
            if (result.success) {
              if (result.data) {
                setFormData(result.data);
                if (result.fromCache) {
                  showMessage({
                    message: 'Modo sin conexión',
                    description: 'Mostrando datos guardados localmente',
                    type: 'info',
                  });
                }
              } else {
                showMessage({
                  message: 'Hoja de vida nueva',
                  description: 'Comienza a llenar tu información',
                  type: 'info',
                });
              }
              return; // Éxito, salir del bucle
            }
          } catch (error) {
            console.error(`Intento ${i + 1} fallido:`, error);
            lastError = error;
            // Esperar antes de reintentar
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }

        // Si llegamos aquí, todos los intentos fallaron
        if (lastError) {
          throw lastError;
        }
      } catch (error) {
        console.error('Error en la inicialización:', error);
        setConnectionError(error.message);
        showMessage({
          message: 'Error de conexión',
          description: 'No se pudo cargar la hoja de vida. Por favor, verifica tu conexión a internet.',
          type: 'danger',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveResume(user.uid, formData);
      showMessage({
        message: 'Éxito',
        description: 'Hoja de vida guardada correctamente',
        type: 'success',
      });
      navigation.goBack();
    } catch (error) {
      showMessage({
        message: 'Error',
        description: 'No se pudo guardar la hoja de vida',
        type: 'danger',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
        copyToCacheDirectory: true
      });

      console.log('Documento seleccionado:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsLoading(true);
        const file = result.assets[0];
        console.log('Preparando archivo para subir:', file);
        
        // Crear objeto de archivo con el formato correcto
        const fileToUpload = {
          uri: file.uri,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size
        };
        
        console.log('Subiendo archivo con userId:', user.uid);
        const uploadResult = await uploadFile(user.uid, fileToUpload);
        console.log('Resultado de la subida:', uploadResult);
        
        if (uploadResult.success) {
          const newAttachments = [...formData.attachments, uploadResult.data];
          console.log('Nueva lista de adjuntos:', newAttachments);
          
          const newFormData = {
            ...formData,
            attachments: newAttachments
          };
          
          // Guardar los cambios en Firestore
          console.log('Guardando en Firestore:', newFormData);
          await saveResume(user.uid, newFormData);
          
          // Actualizar el estado local
          setFormData(newFormData);
          
          showMessage({
            message: 'Éxito',
            description: 'Archivo adjuntado correctamente',
            type: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Error en handleAddAttachment:', error);
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachment, index) => {
    try {
      setIsLoading(true);
      await deleteFile(user.uid, attachment.path);
      
      const newAttachments = formData.attachments.filter((_, i) => i !== index);
      const newFormData = { ...formData, attachments: newAttachments };
      setFormData(newFormData);
      
      // Guardar los cambios en Firestore
      await saveResume(user.uid, newFormData);
      
      showMessage({
        message: 'Éxito',
        description: 'Archivo eliminado correctamente',
        type: 'success',
      });
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment) => {
    try {
      setIsLoading(true);
      const result = await downloadFile(attachment.url, attachment.name);
      
      if (result.success) {
        showMessage({
          message: 'Éxito',
          description: 'Archivo descargado correctamente',
          type: 'success',
        });
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        placeholderTextColor={colors.thin}
        value={formData.personalInfo.fullName}
        onChangeText={(text) => setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, fullName: text }
        })}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor={colors.thin}
        value={formData.personalInfo.phone}
        onChangeText={(text) => setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, phone: text }
        })}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        placeholderTextColor={colors.thin}
        value={formData.personalInfo.address}
        onChangeText={(text) => setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, address: text }
        })}
      />
      <TextInput
        style={styles.input}
        placeholder="Profesión"
        placeholderTextColor={colors.thin}
        value={formData.personalInfo.profession}
        onChangeText={(text) => setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, profession: text }
        })}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Resumen profesional"
        placeholderTextColor={colors.thin}
        value={formData.personalInfo.summary}
        onChangeText={(text) => setFormData({
          ...formData,
          personalInfo: { ...formData.personalInfo, summary: text }
        })}
        multiline
        numberOfLines={4}
      />
    </View>
  );

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Educación</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setFormData({
            ...formData,
            education: [...formData.education, { 
              institution: '', 
              degree: '', 
              year: '',
              description: '' 
            }]
          });
        }}
      >
        <Ionicons name="add-circle" size={24} color={colors.principal} />
        <Text style={styles.addButtonText}>Agregar Educación</Text>
      </TouchableOpacity>
      
      {formData.education.map((edu, index) => (
        <View key={index} style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            placeholder="Institución"
            placeholderTextColor={colors.thin}
            value={edu.institution}
            onChangeText={(text) => {
              const newEducation = [...formData.education];
              newEducation[index].institution = text;
              setFormData({ ...formData, education: newEducation });
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Título"
            placeholderTextColor={colors.thin}
            value={edu.degree}
            onChangeText={(text) => {
              const newEducation = [...formData.education];
              newEducation[index].degree = text;
              setFormData({ ...formData, education: newEducation });
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Año"
            placeholderTextColor={colors.thin}
            value={edu.year}
            onChangeText={(text) => {
              const newEducation = [...formData.education];
              newEducation[index].year = text;
              setFormData({ ...formData, education: newEducation });
            }}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción"
            placeholderTextColor={colors.thin}
            value={edu.description}
            onChangeText={(text) => {
              const newEducation = [...formData.education];
              newEducation[index].description = text;
              setFormData({ ...formData, education: newEducation });
            }}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              const newEducation = formData.education.filter((_, i) => i !== index);
              setFormData({ ...formData, education: newEducation });
            }}
          >
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Experiencia Laboral</Text>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setFormData({
            ...formData,
            experience: [...formData.experience, { 
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              currentJob: false,
              description: ''
            }]
          });
        }}
      >
        <Ionicons name="add-circle" size={24} color={colors.principal} />
        <Text style={styles.addButtonText}>Agregar Experiencia</Text>
      </TouchableOpacity>

      {formData.experience.map((exp, index) => (
        <View key={index} style={styles.itemContainer}>
          <TextInput
            style={styles.input}
            placeholder="Empresa"
            placeholderTextColor={colors.thin}
            value={exp.company}
            onChangeText={(text) => {
              const newExperience = [...formData.experience];
              newExperience[index].company = text;
              setFormData({ ...formData, experience: newExperience });
            }}
          />
          <TextInput
            style={styles.input}
            placeholder="Cargo"
            placeholderTextColor={colors.thin}
            value={exp.position}
            onChangeText={(text) => {
              const newExperience = [...formData.experience];
              newExperience[index].position = text;
              setFormData({ ...formData, experience: newExperience });
            }}
          />
          <View style={styles.dateContainer}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="Fecha inicio"
              placeholderTextColor={colors.thin}
              value={exp.startDate}
              onChangeText={(text) => {
                const newExperience = [...formData.experience];
                newExperience[index].startDate = text;
                setFormData({ ...formData, experience: newExperience });
              }}
            />
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="Fecha fin"
              placeholderTextColor={colors.thin}
              value={exp.endDate}
              onChangeText={(text) => {
                const newExperience = [...formData.experience];
                newExperience[index].endDate = text;
                setFormData({ ...formData, experience: newExperience });
              }}
            />
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción de responsabilidades"
            placeholderTextColor={colors.thin}
            value={exp.description}
            onChangeText={(text) => {
              const newExperience = [...formData.experience];
              newExperience[index].description = text;
              setFormData({ ...formData, experience: newExperience });
            }}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => {
              const newExperience = formData.experience.filter((_, i) => i !== index);
              setFormData({ ...formData, experience: newExperience });
            }}
          >
            <Ionicons name="trash-outline" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderAttachments = () => {
    console.log('Renderizando adjuntos:', formData.attachments);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos Adjuntos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAttachment}
          disabled={isSaving || isLoading}
        >
          <Ionicons name="attach" size={24} color={colors.principal} />
          <Text style={styles.addButtonText}>Agregar Documento</Text>
        </TouchableOpacity>

        {Array.isArray(formData.attachments) && formData.attachments.length > 0 ? (
          formData.attachments.map((attachment, index) => {
            console.log('Renderizando adjunto:', attachment);
            return (
              <View key={index} style={styles.attachmentItem}>
                <TouchableOpacity 
                  style={styles.attachmentContent}
                  onPress={() => handleDownloadAttachment(attachment)}
                >
                  <Ionicons 
                    name={attachment.type.includes('pdf') ? 'document-text-outline' : 'document-outline'} 
                    size={24} 
                    color={colors.principal} 
                  />
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                    <Text style={styles.attachmentSize}>
                      {(attachment.size / 1024).toFixed(1)} KB
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAttachment(attachment, index)}
                  disabled={isSaving || isLoading}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <Text style={styles.noAttachmentsText}>No hay documentos adjuntos</Text>
        )}
      </View>
    );
  };

  if (connectionError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color={colors.error} />
        <Text style={styles.errorTitle}>Error de Conexión</Text>
        <Text style={styles.errorText}>{connectionError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.principal} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={colors.gradienteSecundario} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isSaving}
        >
          <Ionicons name="arrow-back" size={24} color={colors.luminous} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Hoja de Vida</Text>
        <View style={styles.headerRight}>
          {isOffline && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline" size={20} color={colors.error} />
            </View>
          )}
          <TouchableOpacity 
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.luminous} />
            ) : (
              <Text style={styles.saveButtonText}>Guardar</Text>
            )}
          </TouchableOpacity>
          <Image 
            source={require('../../assets/avatardanidev.png')} 
            style={styles.avatarLogo}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.tabContainer}
        >
          {['personal', 'education', 'experience', 'attachments'].map((section) => (
            <TouchableOpacity 
              key={section}
              style={[
                styles.tab, 
                currentSection === section && styles.activeTab
              ]}
              onPress={() => setCurrentSection(section)}
            >
              <Text style={[
                styles.tabText,
                currentSection === section && styles.activeTabText
              ]}>
                {section === 'personal' ? 'Personal' :
                 section === 'education' ? 'Educación' :
                 section === 'experience' ? 'Experiencia' : 'Adjuntos'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {currentSection === 'personal' && renderPersonalInfo()}
        {currentSection === 'education' && renderEducation()}
        {currentSection === 'experience' && renderExperience()}
        {currentSection === 'attachments' && renderAttachments()}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  backButton: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: colors.principal,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.fondoClaro,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: colors.fondoClaro,
    borderWidth: 1,
    borderColor: colors.principal,
  },
  activeTab: {
    backgroundColor: colors.principal,
  },
  tabText: {
    color: colors.principal,
    fontWeight: 'bold',
  },
  activeTabText: {
    color: colors.luminous,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 15,
  },
  input: {
    backgroundColor: colors.fondoClaro,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.delicate,
    color: colors.default,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 15,
  },
  addButtonText: {
    color: colors.principal,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: colors.fondoClaro,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.delicate,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateInput: {
    flex: 0.48,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.delicate,
  },
  attachmentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentInfo: {
    flex: 1,
    marginLeft: 10,
  },
  attachmentName: {
    flex: 1,
    marginLeft: 10,
    color: colors.default,
  },
  attachmentSize: {
    fontSize: 12,
    color: colors.thin,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
  },
  loadingText: {
    marginTop: 10,
    color: colors.default,
    fontSize: 16,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  offlineIndicator: {
    backgroundColor: colors.fondoClaro,
    padding: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.error,
    marginTop: 10,
    marginBottom: 5,
  },
  errorText: {
    fontSize: 16,
    color: colors.thin,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.principal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
  noAttachmentsText: {
    color: colors.thin,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ResumeScreen; 