import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

const DEFAULT_COMPANY_LOGO = process.env.EXPO_PUBLIC_DEFAULT_COMPANY_LOGO;
const JobCard = ({ job, onPress }) => {
  if (!job) return null;

  const {
    employer_logo,
    employer_name,
    job_country,
    job_title,
    job_employment_type,
    job_salary
  } = job;

  return (
    <TouchableOpacity onPress={() => onPress(job)} style={styles.cardContainer}>
      <LinearGradient colors={colors.gradientePrimario} style={styles.gradient}>
        <View style={styles.header}>
          <Image 
            source={{ 
              uri: employer_logo || DEFAULT_COMPANY_LOGO
            }} 
            style={styles.logo}
            defaultSource={require('../../assets/default-company.png')}
          />
          <View style={styles.headerText}>
            <Text style={styles.company} numberOfLines={1}>
              {employer_name || 'Empresa no especificada'}
            </Text>
            <Text style={styles.location} numberOfLines={1}>
              {job_country || 'Ubicación no especificada'}
            </Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {job_title || 'Título no especificado'}
          </Text>
          <Text style={styles.type} numberOfLines={1}>
            {job_employment_type || 'Tipo no especificado'}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.salary} numberOfLines={1}>
            {job_salary || 'Salario no especificado'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 300,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: colors.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradient: {
    flex: 1,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.luminous,
  },
  headerText: {
    marginLeft: 10,
    flex: 1,
  },
  company: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: 'bold',
  },
  location: {
    color: colors.variante5,
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.luminous,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  type: {
    color: colors.variante4,
    fontSize: 14,
  },
  footer: {
    marginTop: 10,
  },
  salary: {
    color: colors.variante5,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default JobCard; 