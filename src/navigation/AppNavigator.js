import React from "react";
import { Image, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import colors from "../constants/colors";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNotifications } from '../context/NotificationContext';

import HomeScreen from "../screens/HomeScreen";
import SplashScreen from "../screens/SplashScreen";
import UserScreen from "../screens/UserScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import AboutScreen from "../screens/AboutScreen";
import JobsScreen from "../screens/JobsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationScreen from "../screens/NotificationScreen"
import ResumeScreen from "../screens/ResumeScreen";
import MyJobsScreen from '../screens/MyJobsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const ProfileStack = createNativeStackNavigator();

const TabNavigator = () => {
    const { user } = useAuth();
    const { unreadCount } = useNotifications();

    return (
        <Tab.Navigator 
            initialRouteName="Home" 
            screenOptions={({ route }) => ({
                tabBarIcon: ({color, size, focused}) => {
                    let iconName;

                    if (route.name === "Home") {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === "Job") {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === "User") {
                        // Si es la pestaña de usuario y hay una foto de perfil, mostrarla
                        if (user?.photoURL) {
                            return (
                                <View style={{
                                    width: size,
                                    height: size,
                                    borderRadius: size / 2,
                                    borderWidth: focused ? 2 : 0,
                                    borderColor: color,
                                    overflow: 'hidden'
                                }}>
                                    <Image
                                        source={{ uri: user.photoURL }}
                                        style={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    />
                                </View>
                            );
                        }
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === "Notification") {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    }
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.principal,
                tabBarInactiveTintColor: colors.thin,
                tabBarStyle: {
                    backgroundColor: colors.luminous,
                    borderTopWidth: 0,
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                },
                headerShown: false
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                    tabBarLabel: 'Inicio'
                }}
            />
            <Tab.Screen 
                name="Job" 
                component={JobsScreen} 
                options={{
                    tabBarLabel: 'Empleos'
                }}
            />
            <Tab.Screen 
                name="User" 
                component={UserScreen} 
                options={{
                    tabBarLabel: 'Perfil'
                }}
            />
            <Tab.Screen 
                name="Notification" 
                component={NotificationScreen} 
                options={{
                    tabBarLabel: 'Notificaciones',
                    tabBarBadge: unreadCount > 0 ? unreadCount : null,
                    tabBarBadgeStyle: {
                        backgroundColor: colors.principal,
                    }
                }}
            />
        </Tab.Navigator>
    );
};

const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.principal,
        },
        headerTintColor: colors.luminous,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={UserScreen}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Configuración',
        }}
      />
      <ProfileStack.Screen
        name="MyJobs"
        component={MyJobsScreen}
        options={{
          title: 'Mis Empleos',
        }}
      />
    </ProfileStack.Navigator>
  );
};

const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false}} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{headerShown: false}}/>
            <Stack.Screen name="About" component={AboutScreen} options={{headerShown: false}} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{headerShown: false}} />
            <Stack.Screen name="Resume" component={ResumeScreen} options={{headerShown: false}} />
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{headerShown: false}} />
            <Stack.Screen name="ProfileStack" component={ProfileStackScreen} options={{headerShown: false}} />
        </Stack.Navigator>
    );
};

export default AppNavigator;