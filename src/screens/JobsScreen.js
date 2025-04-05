import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import colors from '../constants/colors'

const JobsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Jobs Screen</Text>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.variante2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
      fontSize: 24,
      color: colors.luminous,
      fontWeight: 'bold'
    }
    })


export default JobsScreen