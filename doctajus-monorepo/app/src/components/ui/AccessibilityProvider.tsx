import React, { createContext, useContext, useState, useEffect } from 'react';

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  readAloud: boolean;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReadAloud: () => void;
  toggleReducedMotion: () => void;
  toggleKeyboardNavigation: () => void;
  resetSettings: () => void;
}

// Valores predeterminados del contexto
const defaultAccessibilityContext: AccessibilityContextType = {
  highContrast: false,
  largeText: false,
  readAloud: false,
  reducedMotion: false,
  keyboardNavigation: false,
  toggleHighContrast: () => {},
  toggleLargeText: () => {},
  toggleReadAloud: () => {},
  toggleReducedMotion: () => {},
  toggleKeyboardNavigation: () => {},
  resetSettings: () => {}
};

// Crear el contexto
const AccessibilityContext = createContext<AccessibilityContextType>(defaultAccessibilityContext);

// Hook personalizado para usar el contexto
export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  // Cargar configuración desde localStorage si existe
  const loadSettingsFromStorage = () => {
    try {
      const storedSettings = localStorage.getItem('accessibilitySettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        return {
          highContrast: settings.highContrast || false,
          largeText: settings.largeText || false,
          readAloud: settings.readAloud || false,
          reducedMotion: settings.reducedMotion || false,
          keyboardNavigation: settings.keyboardNavigation || false
        };
      }
    } catch (error) {
      console.error('Error al cargar configuración de accesibilidad:', error);
    }
    return {
      highContrast: false,
      largeText: false,
      readAloud: false,
      reducedMotion: false,
      keyboardNavigation: false
    };
  };

  // Estado para las opciones de accesibilidad
  const [settings, setSettings] = useState(loadSettingsFromStorage);

  // Guardar configuración en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));

      // Aplicar estilos globales según la configuración
      document.documentElement.classList.toggle('high-contrast', settings.highContrast);
      document.documentElement.classList.toggle('large-text', settings.largeText);
      document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
      document.documentElement.classList.toggle('keyboard-navigation', settings.keyboardNavigation);
    } catch (error) {
      console.error('Error al guardar configuración de accesibilidad:', error);
    }
  }, [settings]);

  // Funciones para cambiar la configuración
  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleLargeText = () => {
    setSettings(prev => ({ ...prev, largeText: !prev.largeText }));
  };

  const toggleReadAloud = () => {
    setSettings(prev => ({ ...prev, readAloud: !prev.readAloud }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  const toggleKeyboardNavigation = () => {
    setSettings(prev => ({ ...prev, keyboardNavigation: !prev.keyboardNavigation }));
  };

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      readAloud: false,
      reducedMotion: false,
      keyboardNavigation: false
    });
  };

  // Valor del contexto
  const contextValue: AccessibilityContextType = {
    ...settings,
    toggleHighContrast,
    toggleLargeText,
    toggleReadAloud,
    toggleReducedMotion,
    toggleKeyboardNavigation,
    resetSettings
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export default AccessibilityProvider;
