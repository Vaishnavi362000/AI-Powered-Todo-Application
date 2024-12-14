import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Switch, Surface, Text, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SettingsScreen() {
  const { isDarkMode, setIsDarkMode, theme } = useTheme();
  const [notifications, setNotifications] = React.useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>
            Appearance
          </List.Subheader>
          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                color={theme.colors.primary}
              />
            )}
          />
          <Divider />
          <List.Subheader style={{ color: theme.colors.primary }}>
            Notifications
          </List.Subheader>
          <List.Item
            title="Push Notifications"
            description="Get notified about tasks and deadlines"
            left={props => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  surface: {
    borderRadius: 16,
    elevation: 4,
  },
}); 