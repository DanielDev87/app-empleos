import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Linking,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const AboutScreen = ({ navigation }) => {
  const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;
  const developerEmail = process.env.EXPO_PUBLIC_DEVELOPER_EMAIL;
  
  const socialLinks = [
    {
      name: 'YouTube',
      icon: 'logo-youtube',
      url: process.env.EXPO_PUBLIC_YOUTUBE,
      color: '#FF0000'
    },
    {
      name: 'GitHub',
      icon: 'logo-github',
      url: process.env.EXPO_PUBLIC_GITHUB,
      color: '#333'
    },
    {
      name: 'LinkedIn',
      icon: 'logo-linkedin',
      url: process.env.EXPO_PUBLIC_LINKEDIN,
      color: '#0077B5'
    },
    {
      name: 'Portfolio',
      icon: 'globe-outline',
      url: process.env.EXPO_PUBLIC_PORTFOLIO,
      color: '#4CAF50'
    }
  ];

  const sections = [
    {
      title: 'Descripción',
      content: 'App Empleos es una aplicación móvil diseñada para conectar profesionales con oportunidades laborales. Facilitamos la búsqueda de empleo y el proceso de aplicación, permitiendo a los usuarios gestionar su perfil profesional y hoja de vida de manera eficiente.'
    },
    {
      title: 'Desarrollador',
      content: 'Daniel Felipe Agudelo Molina\nDesarrollador de Software © 2025'
    },
    {
      title: 'Características Principales',
      content: [
        'Búsqueda de empleos en tiempo real',
        'Gestión de hoja de vida digital',
        'Aplicación directa a ofertas laborales',
        'Notificaciones personalizadas',
        'Interfaz intuitiva y moderna'
      ]
    },
    {
      title: 'Información Legal',
      content: 'Esta aplicación está protegida por derechos de autor © 2025. Todos los derechos reservados. El uso de esta aplicación está sujeto a nuestros términos de servicio y política de privacidad.'
    },
    {
      title: 'Términos y Condiciones',
      content: 'Al usar esta aplicación, aceptas nuestros términos y condiciones. Nos reservamos el derecho de modificar o descontinuar el servicio en cualquier momento. Para más información, visita nuestra página web.'
    },
    {
      title: 'Privacidad',
      content: 'Protegemos tu privacidad y datos personales de acuerdo con las leyes y regulaciones aplicables. Tus datos son almacenados de forma segura y no serán compartidos con terceros sin tu consentimiento explícito.'
    }
  ];

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${developerEmail}`);
  };

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error al abrir el enlace:', error);
    }
  };

  const renderSection = (section, index) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {Array.isArray(section.content) ? (
        <View style={styles.bulletList}>
          {section.content.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.sectionContent}>
          {section.content}
        </Text>
      )}
    </View>
  );

  return (
    <LinearGradient colors={colors.gradienteSecundario} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.luminous} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acerca de</Text>
        <Image 
          source={require('../../assets/avatardanidev.png')} 
          style={styles.avatarLogo}
        />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.appInfo}>
          <Image 
            source={require('../../assets/avatardanidev.png')} 
            style={styles.appLogo}
          />
          <Text style={styles.appName}>App Empleos</Text>
          <Text style={styles.version}>Versión {appVersion}</Text>
        </View>

        {sections.map((section, index) => renderSection(section, index))}

        <View style={styles.socialLinks}>
          {socialLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.socialButton, { backgroundColor: link.color }]}
              onPress={() => handleOpenLink(link.url)}
            >
              <Ionicons name={link.icon} size={24} color={colors.luminous} />
              <Text style={styles.socialButtonText}>{link.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.emailButton} 
          onPress={handleEmailPress}
        >
          <Ionicons name="mail" size={24} color={colors.luminous} />
          <Text style={styles.emailButtonText}>Contáctame</Text>
        </TouchableOpacity>
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
  avatarLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    backgroundColor: colors.fondoClaro,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  appInfo: {
    alignItems: 'center',
    padding: 30,
    borderBottomWidth: 1,
    borderBottomColor: colors.delicate,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.default,
    marginTop: 10,
  },
  version: {
    fontSize: 16,
    color: colors.thin,
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.delicate,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.default,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: colors.thin,
    lineHeight: 24,
  },
  bulletList: {
    marginTop: 5,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: colors.principal,
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: colors.thin,
    lineHeight: 24,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.principal,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  emailButtonText: {
    color: colors.luminous,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
    minWidth: 130,
    justifyContent: 'center',
    gap: 8,
  },
  socialButtonText: {
    color: colors.luminous,
    fontSize: 14,
    fontWeight: '500',
  },
  appLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
});

export default AboutScreen;