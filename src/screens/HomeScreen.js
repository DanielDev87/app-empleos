import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import colors from '../constants/colors'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../context/AuthContext'
import JobCarousel from '../components/JobCarousel'
import useJobs from '../hooks/useJobs'
import ModalJobDetails from '../components/ModalJobDetails'
import { Ionicons } from '@expo/vector-icons'

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const { jobs, loading, error, searchJobs } = useJobs()
  const [selectedJob, setSelectedJob] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchJobs(searchQuery.trim())
    }
  }

  const handleJobPress = (job) => {
    setSelectedJob(job)
    setModalVisible(true)
  }

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.principal} />
          <Text style={styles.loadingText}>Buscando empleos...</Text>
        </View>
      )
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => searchJobs(searchQuery)}
          >
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      )
    }

    if (jobs.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.noResultsText}>No se encontraron empleos</Text>
          <Text style={styles.noResultsSubtext}>Intenta con otros términos de búsqueda</Text>
        </View>
      )
    }

    return (
      <JobCarousel
        jobs={jobs}
        loading={loading}
        onJobPress={handleJobPress}
      />
    )
  }

  return (
    <ScrollView style={styles.scrollView}>
      <LinearGradient colors={colors.gradienteSecundario} style={styles.container}>
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Hola, {user?.displayName || 'Usuario'}</Text>
            <Image 
              source={require('../../assets/avatardanidev.png')} 
              style={styles.avatarLogo}
            />
          </View>
          <Text style={styles.subtitle}>Encuentra tu próximo trabajo</Text>
          
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
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? 'Resultados de búsqueda' : 'Empleos Destacados'}
          </Text>
          
          {renderContent()}
        </View>
      </LinearGradient>

      <ModalJobDetails
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
        onSave={() => {}}
        onApply={() => {}}
        onShare={() => {}}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
  },
  container: {
    flex: 1,
    minHeight: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
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
  subtitle: {
    fontSize: 16,
    color: colors.variante5,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: colors.luminous,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    padding: 10,
    marginRight: 5,
  },
  content: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.default,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  centerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fondoClaro,
    borderRadius: 10,
    marginVertical: 10,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
  },
  loadingText: {
    color: colors.thin,
    marginTop: 10,
    fontSize: 16,
  },
  noResultsText: {
    fontSize: 18,
    color: colors.thin,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: colors.delicate,
  },
  retryButton: {
    backgroundColor: colors.principal,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  retryText: {
    color: colors.luminous,
    fontWeight: 'bold',
  },
})

export default HomeScreen