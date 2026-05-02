// frontend/src/context/ThemeContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  purple: {
    name: 'purple',
    primary: '#8f4bd8',
    primaryDark: '#7a3fc2',
    primaryLight: '#b99af1',
    background: 'linear-gradient(135deg, #cbb7e6, #a88bd8)',
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    buttonBg: '#8f4bd8',
    buttonHover: '#7a3fc2',
    textColor: '#2e3d4c',
    textLight: '#666',
    iconColor: '#2e3d4c',
    iconHover: '#7a3fc2',
    bubbleOpacity: 0.4,
    borderColor: 'rgba(255,255,255,0.25)',
    borderHover: 'rgba(255,255,255,0.4)',
  },
  pink: {
    name: 'pink',
    primary: '#b84a57',
    primaryDark: '#9e3f4a',
    primaryLight: '#d99aa5',
    background: 'linear-gradient(135deg, #b45f69, #d8a0aa)',
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    buttonBg: '#b84a57',
    buttonHover: '#9e3f4a',
    textColor: '#5a2d36',
    textLight: '#8a5a63',
    iconColor: '#5a2d36',
    iconHover: '#9e3f4a',
    bubbleOpacity: 0.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderHover: 'rgba(255,255,255,0.4)',
  },
  yellow: {
    name: 'yellow',
    primary: '#d4a843',
    primaryDark: '#c29738',
    primaryLight: '#f0dc82',
    background: 'linear-gradient(135deg, #f5e6a3, #e8d47a)',
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    buttonBg: '#d4a843',
    buttonHover: '#c29738',
    textColor: '#5c4a1e',
    textLight: '#8a7240',
    iconColor: '#5c4a1e',
    iconHover: '#c29738',
    bubbleOpacity: 0.4,
    borderColor: 'rgba(255,255,255,0.25)',
    borderHover: 'rgba(255,255,255,0.4)',
  },
  green: {
    name: 'green',
    primary: '#3d8f5e',
    primaryDark: '#2d6b46',
    primaryLight: '#9ed6b0',
    background: 'linear-gradient(135deg, #a8e6cf, #7ecba1)',
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    buttonBg: '#3d8f5e',
    buttonHover: '#2d6b46',
    textColor: '#1a4d2e',
    textLight: '#4a7a5e',
    iconColor: '#1a4d2e',
    iconHover: '#2d6b46',
    bubbleOpacity: 0.4,
    borderColor: 'rgba(255,255,255,0.25)',
    borderHover: 'rgba(255,255,255,0.4)',
  },
  blue: {
    name: 'blue',
    primary: '#3a7ca5',
    primaryDark: '#2d6182',
    primaryLight: '#9cc9e0',
    background: 'linear-gradient(135deg, #a8d8ea, #7cb8d4)',
    cardBg: 'rgba(255,255,255,0.12)',
    cardBgHover: 'rgba(255,255,255,0.18)',
    buttonBg: '#3a7ca5',
    buttonHover: '#2d6182',
    textColor: '#1a3a4d',
    textLight: '#4a6a7d',
    iconColor: '#1a3a4d',
    iconHover: '#2d6182',
    bubbleOpacity: 0.4,
    borderColor: 'rgba(255,255,255,0.25)',
    borderHover: 'rgba(255,255,255,0.4)',
  },
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('purple');
  const [themeData, setThemeData] = useState(themes.purple);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
      setThemeData(themes[themeName]);
      localStorage.setItem('theme', themeName);
      window.dispatchEvent(new CustomEvent('themeChange', { detail: themes[themeName] }));
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
      setThemeData(themes[savedTheme]);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ currentTheme, themeData, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};