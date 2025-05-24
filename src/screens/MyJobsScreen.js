import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import ModalJobDetails from '../components/ModalJobDetails';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUSBAR_HEIGHT = StatusBar.currentHeight || 44;

const MyJobsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const savedJobsData = await AsyncStorage.getItem(`@savedJobs_${user?.uid}`);
      const appliedJobsData = await AsyncStorage.getItem(`@appliedJobs_${user?.uid}`);
      
      setSavedJobs(savedJobsData ? JSON.parse(savedJobsData) : []);
      setAppliedJobs(appliedJobsData ? JSON.parse(appliedJobsData) : []);
    } catch (error) {
      console.error('Error al cargar los empleos:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeJob = async (jobId) => {
    try {
      const storageKey = activeTab === 'saved' ? `@savedJobs_${user?.uid}` : `@appliedJobs_${user?.uid}`;
      const currentList = activeTab === 'saved' ? savedJobs : appliedJobs;
      
      const updatedJobs = currentList.filter(job => job.job_id !== jobId);
      
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedJobs));
      
      if (activeTab === 'saved') {
        setSavedJobs(updatedJobs);
      } else {
        setAppliedJobs(updatedJobs);
      }

      Alert.alert(
        'Éxito',
        `Empleo eliminado de ${activeTab === 'saved' ? 'guardados' : 'aplicados'} correctamente`
      );
    } catch (error) {
      console.error('Error al eliminar el empleo:', error);
      Alert.alert(
        'Error',
        'No se pudo eliminar el empleo. Por favor, intenta de nuevo.'
      );
    }
  };

  const handleRemoveJob = (jobId) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que deseas eliminar este empleo de ${activeTab === 'saved' ? 'guardados' : 'aplicados'}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Eliminar',
          onPress: () => removeJob(jobId),
          style: 'destructive'
        }
      ]
    );
  };

  const handleJobPress = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const renderJobCard = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleJobPress(item)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.companyInfo}>
          {item.employer_logo ? (
            <Image
              source={{ uri: item.employer_logo }}
              style={styles.companyLogo}
              defaultSource={require('../../assets/default-company.png')}
            />
          ) : (
            <View style={[styles.companyLogo, styles.placeholderLogo]}>
              <Ionicons name="business" size={20} color={colors.thin} />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.jobTitle} numberOfLines={2}>
              {item.job_title}
            </Text>
            <Text style={styles.company} numberOfLines={1}>
              {item.employer_name}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveJob(item.job_id)}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.jobDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color={colors.principal} />
          <Text style={styles.detailText} numberOfLines={1}>
            {item.job_country || 'Ubicación no especificada'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color={colors.principal} />
          <Text style={styles.detailText}>
            {item.job_employment_type || 'Tipo no especificado'}
          </Text>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <Text style={[
          styles.statusText,
          { color: activeTab === 'saved' ? colors.variante8 : colors.exito }
        ]}>
          {activeTab === 'saved' ? 'Guardado' : 'Aplicado'}
        </Text>
        <Text style={styles.dateText}>
          {new Date(item.savedAt || item.appliedAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={activeTab === 'saved' ? 'bookmark' : 'document-text'}
        size={48}
        color={colors.thin}
      />
      <Text style={styles.emptyTitle}>
        No hay empleos {activeTab === 'saved' ? 'guardados' : 'aplicados'}
      </Text>
      <Text style={styles.emptyText}>
        Los empleos {activeTab === 'saved' ? 'guardados' : 'a los que apliques'} aparecerán aquí
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.safeContainer}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.principal}
          translucent
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.principal} />
          <Text style={styles.loadingText}>Cargando empleos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeContainer}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.principal}
        translucent
      />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.luminous} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Empleos</Text>
          <Image 
            source={require('../../assets/avatardanidev.png')} 
            style={styles.avatarLogo}
          />
        </View>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
            onPress={() => setActiveTab('saved')}
          >
            <Ionicons
              name="bookmark"
              size={20}
              color={activeTab === 'saved' ? colors.luminous : colors.thin}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'saved' && styles.activeTabText
            ]}>
              Guardados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'applied' && styles.activeTab]}
            onPress={() => setActiveTab('applied')}
          >
            <Ionicons
              name="document-text"
              size={20}
              color={activeTab === 'applied' ? colors.luminous : colors.thin}
            />
            <Text style={[
              styles.tabText,
              activeTab === 'applied' && styles.activeTabText
            ]}>
              Aplicados
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={activeTab === 'saved' ? savedJobs : appliedJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => `${item.job_id}-${activeTab}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      <ModalJobDetails
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
  },
  header: {
    backgroundColor: colors.principal,
    paddingTop: STATUSBAR_HEIGHT + 10,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.luminous,
  },
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 5,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tabText: {
    marginLeft: 5,
    color: colors.thin,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.luminous,
  },
  listContainer: {
    padding: 15,
    flexGrow: 1,
  },
  jobCard: {
    backgroundColor: colors.luminous,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: colors.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  placeholderLogo: {
    backgroundColor: colors.delicate,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: colors.thin,
  },
  jobDetails: {
    marginTop: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.thin,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.delicate,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: colors.thin,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.fondoClaro,
  },
  loadingText: {
    marginTop: 10,
    color: colors.thin,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.thin,
    marginTop: 10,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 14,
    color: colors.delicate,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  removeButton: {
    padding: 8,
    marginRight: -5,
  },
});

export default MyJobsScreen; 