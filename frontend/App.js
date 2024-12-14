import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeProvider } from './src/context/ThemeContext';

import TaskStack from './src/navigation/TaskStack';
import BucketListScreen from './src/screens/BucketList';
import HabitTrackerScreen from './src/screens/HabitTracker';
import SettingsScreen from './src/screens/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
            tabBarStyle: {
              position: 'relative',
              height: 60,
              borderTopWidth: 0,
              elevation: 8,
              backgroundColor: '#FFFFFF',
            },
            tabBarActiveTintColor: '#9B7EDE',
            tabBarInactiveTintColor: '#B19CD9',
            tabBarShowLabel: true,
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 4,
            },
            headerStyle: {
              backgroundColor: '#9B7EDE',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Tasks"
            component={TaskStack}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="BucketList"
            component={BucketListScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="format-list-checks" size={size} color={color} />
              ),
              headerTitle: 'Bucket List',
            }}
          />
          <Tab.Screen
            name="Habits"
            component={HabitTrackerScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
              ),
              headerTitle: 'Habit Tracker',
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="cog" size={size} color={color} />
              ),
              headerTitle: 'Settings',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </ThemeProvider>
  );
}


