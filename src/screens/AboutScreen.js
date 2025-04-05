import React from 'react'
import { View, Text, StyleSheet,TouchableOpacity } from 'react-native'
import colors from '../constants/colors'

const AboutScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text>About Screen</Text>
      <Text>Version 1.0.0</Text>
      <Text>Desarrollado por DanielDev87</Text>
      <TouchableOpacity onPress={()=> navigation.navigate('User')}>
      <Text>Atrás</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.variante3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    })

export default AboutScreen