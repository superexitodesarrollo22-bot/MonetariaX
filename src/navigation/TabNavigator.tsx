import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Theme from '../theme';

// Pantallas placeholder — se reemplazan en prompts siguientes
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import MovimientosScreen from '../screens/Movimientos/MovimientosScreen';
import DeudasScreen from '../screens/Deudas/DeudasScreen';
import AnalisisScreen from '../screens/Analisis/AnalisisScreen';

const Tab = createBottomTabNavigator();

const tabs = [
  {
    name: 'Dashboard',
    component: DashboardScreen,
    icon: 'view-dashboard-outline',
    iconActive: 'view-dashboard',
    label: 'Inicio',
  },
  {
    name: 'Movimientos',
    component: MovimientosScreen,
    icon: 'swap-vertical-circle-outline',
    iconActive: 'swap-vertical-circle',
    label: 'Movimientos',
  },
  {
    name: 'Deudas',
    component: DeudasScreen,
    icon: 'credit-card-outline',
    iconActive: 'credit-card',
    label: 'Deudas',
  },
  {
    name: 'Analisis',
    component: AnalisisScreen,
    icon: 'chart-box-outline',
    iconActive: 'chart-box',
    label: 'Análisis',
  },
];

const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const tab = tabs.find(t => t.name === route.name)!;
      return {
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.textLight,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => (
          <MaterialCommunityIcons
            name={(focused ? tab.iconActive : tab.icon) as any}
            size={26}
            color={color}
          />
        ),
        tabBarLabel: tab.label,
      };
    }}
  >
    {tabs.map(tab => (
      <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
    ))}
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Theme.colors.card,
    borderTopColor: Theme.colors.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 84 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default TabNavigator;
