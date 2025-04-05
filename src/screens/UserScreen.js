import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {useAuth} from '../context/AuthContext'

const UserScreen = ({navigation}) => {
  const {user}=useAuth()
  return (
    <View style={styles.container}>
      <Text>{user?.displayName || 'Usuario'}</Text>
      <TouchableOpacity onPress={()=> navigation.navigate()}>
      <Text>Editar perfil</Text>
      </TouchableOpacity>
      <Text>User Screen</Text>
      <View >
      <TouchableOpacity onPress={()=> navigation.navigate('About')}>
      <Text>Acerca de: </Text>
      </TouchableOpacity >
        

      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    })

export default UserScreen