import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Image,
  StatusBar,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useJobs from '../hooks/useJobs';
import colors from '../constants/colors';
import ModalJobDetails from '../components/ModalJobDetails';

const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight;

const JobsScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});

  const { jobs, loading, error, hasMore, totalJobs, searchJobs } = useJobs();

  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Realizar búsqueda inicial
  useEffect(() => {
    searchJobs('developer');
  }, []);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (searchQuery.trim()) {
      searchJobs(searchQuery.trim());
    }
    setIsRefreshing(false);
  }, [searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchJobs(searchQuery.trim());
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    if (searchQuery.trim()) {
      searchJobs(searchQuery.trim());
    }
    setShowFilters(false);
  };

  // Función para generar una key única para cada trabajo
  const generateJobKey = (job, index) => {
    return `${job.job_id || 'job'}-${index}-${currentPage}`;
  };

  const renderJobCard = ({ item, index }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => handleSelectJob(item)}
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
        <Ionicons name="chevron-forward" size={24} color={colors.thin} />
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
        {item.job_salary && (
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color={colors.principal} />
            <Text style={styles.detailText} numberOfLines={1}>
              {item.job_salary}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={colors.principal} />
      </View>
    );
  };

  const FiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtros</Text>
          
          <Text style={styles.filterLabel}>Tipo de empleo</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="FULL_TIME, PART_TIME, CONTRACTOR..."
            value={filters.employment_type}
            onChangeText={(text) => handleFilterChange('employment_type', text)}
          />

          <Text style={styles.filterLabel}>País</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="US, GB, ES..."
            value={filters.job_country}
            onChangeText={(text) => handleFilterChange('job_country', text)}
          />

          <Text style={styles.filterLabel}>Fecha de publicación</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="all, today, 3days, week..."
            value={filters.date_posted}
            onChangeText={(text) => handleFilterChange('date_posted', text)}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.principal} />
          <Text style={styles.loadingText}>Buscando empleos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRefresh}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!jobs || jobs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="search" size={48} color={colors.thin} />
          <Text style={styles.noResultsText}>No se encontraron empleos</Text>
          <Text style={styles.noResultsSubtext}>
            Intenta con otros términos de búsqueda
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.principal}
        translucent
      />
      <LinearGradient 
        colors={colors.gradienteSecundario} 
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Empleos</Text>
            <Image 
              source={require('../../assets/avatardanidev.png')} 
              style={styles.avatarLogo}
            />
          </View>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar empleos..."
            placeholderTextColor={colors.delicate}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
            <Ionicons name="search" size={24} color={colors.luminous} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Ionicons name="options" size={24} color={colors.luminous} />
          </TouchableOpacity>
        </View>
        
        {totalJobs > 0 && (
          <Text style={styles.resultsCount}>
            {totalJobs} empleos encontrados
          </Text>
        )}
      </LinearGradient>

      {renderEmptyState()}

      {!loading && !error && jobs && jobs.length > 0 && (
        <FlatList
          data={jobs}
          renderItem={renderJobCard}
          keyExtractor={(item, index) => generateJobKey(item, index)}
          contentContainerStyle={styles.listContainer}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.principal]}
            />
          }
        />
      )}

      <ModalJobDetails
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
      />

      <FiltersModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
  },
  header: {
    paddingTop: STATUSBAR_HEIGHT + 15,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  headerTop: {
    marginBottom: 15,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  greeting: {
    fontSize: 24,
    color: colors.luminous,
    fontWeight: 'bold',
  },
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.luminous,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    color: colors.default,
  },
  searchButton: {
    padding: 10,
  },
  filterButton: {
    padding: 10,
    marginLeft: 5,
  },
  resultsCount: {
    color: colors.luminous,
    fontSize: 14,
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
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
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: colors.principal,
    padding: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.luminous,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    color: colors.default,
    marginBottom: 5,
  },
  filterInput: {
    backgroundColor: colors.fondoClaro,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: colors.default,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.delicate,
  },
  applyButton: {
    backgroundColor: colors.principal,
  },
  cancelButtonText: {
    color: colors.default,
    fontWeight: 'bold',
  },
  applyButtonText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.thin,
  },
  noResultsText: {
    fontSize: 18,
    color: colors.thin,
    marginTop: 10,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.delicate,
    textAlign: 'center',
  },
});

export default JobsScreen;
