import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ProductListScreen from '../screens/ProductListScreen';
import OrderScreen from '../screens/OrderScreen';
import CustomerScreen from '../screens/CustomerScreen';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'Dashboard') iconName = 'insights';
          else if (route.name === 'Inventory') iconName = 'precision-manufacturing';
          else if (route.name === 'Orders') iconName = 'shopping-basket';
          else if (route.name === 'Customers') iconName = 'badge';
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          backgroundColor: Colors.white,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Inventory" component={ProductListScreen} />
      <Tab.Screen name="Orders" component={OrderScreen} />
      <Tab.Screen name="Customers" component={CustomerScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
