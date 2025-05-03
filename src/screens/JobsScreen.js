import React, { useState } from 'react';
import { Pressable, View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import useJobs from '../hooks/useJobs';
import colors from '../constants/colors';
import ModalJobDetails from '../components/ModalJobDetails'; // Asegúrate que esté bien importado

const JobsScreen = () => {
  const { jobs, loading, error } = useJobs('React Native Developer');
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <Pressable onPress={() => handleSelectJob(item)}>
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{item.job_title}</Text>
        <Text style={styles.company}>{item.employer_name}</Text>
      </View>
    </Pressable>
  );

  if (loading) return <ActivityIndicator size="large" color={colors.luminous} style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.text}>Error al cargar empleos.</Text>;

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        renderItem={renderItem}
        keyExtractor={(item) => item.job_id}
        contentContainerStyle={{ padding: 20 }}
      />

      {/* Modal de detalles del empleo */}
      <ModalJobDetails
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.variante2,
  },
  jobCard: {
    backgroundColor: colors.luminous,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 16,
    color: '#555',
  },
  text: {
    fontSize: 20,
    color: colors.luminous,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default JobsScreen;
