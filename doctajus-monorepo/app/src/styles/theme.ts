// Definición de tokens de diseño para la aplicación DoctaJus
// Este archivo centraliza los valores que definen la apariencia visual de la aplicación

export const themeColors = {
  // Colores primarios
  primary: '#1890ff', // Azul principal
  primaryLight: '#69c0ff',
  primaryDark: '#0050b3',

  // Colores secundarios
  secondary: '#13c2c2', // Turquesa
  secondaryLight: '#5cdbd3',
  secondaryDark: '#006d75',

  // Colores de estado
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
  info: '#1890ff',

  // Colores neutros
  text: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(0, 0, 0, 0.65)',
    disabled: 'rgba(0, 0, 0, 0.45)',
    hint: 'rgba(0, 0, 0, 0.35)',
  },

  background: {
    default: '#f0f2f5',
    paper: '#ffffff',
    light: '#f5f5f5',
  },

  border: {
    light: '#f0f0f0',
    default: '#d9d9d9',
    dark: '#bfbfbf',
  },
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",

  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '30px',
  },

  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
};

export const borderRadius = {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  circle: '50%',
};

export const transitions = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.5s',
};

export const zIndex = {
  drawer: 1000,
  modal: 1300,
  tooltip: 1500,
  toast: 1700,
};

// Exportar todo en un objeto unificado para facilitar el acceso
const theme = {
  colors: themeColors,
  shadows,
  spacing,
  typography,
  borderRadius,
  transitions,
  zIndex,
};

export default theme;
