import React, { createContext, useContext, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9B7EDE',
    secondary: '#B19CD9',
    background: '#F8F7FF',
    surface: '#FFFFFF',
    text: '#333333',
    subtext: '#666666',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#B19CD9',
    secondary: '#9B7EDE',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FFFFFF',
    subtext: '#CCCCCC',
  },
};

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext); 