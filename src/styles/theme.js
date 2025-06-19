// StayKaru App Colors and Styles

// Safely create a nested object without worry about undefined properties
const safeMerge = (target, source) => {
  const result = { ...target };
  if (!source) return result;
  
  Object.keys(source).forEach(key => {
    if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
      result[key] = safeMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  });
  
  return result;
};

export const Colors = {
  // Primary colors
  primary: '#4A6572',
  secondary: '#F9AA33',
  
  // Secondary colors
  red: '#FF6B6B',
  teal: '#4ECDC4',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    light: '#F5F5F5',
    medium: '#E0E0E0',
    dark: '#666666',
  },
  
  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    card: '#FFFFFF',
  },
  
  // Status colors
  success: '#4ECDC4',
  warning: '#F9AA33',
  error: '#FF6B6B',
  info: '#4A6572',
};

export const Typography = {
  fontSize: {
    small: 12,
    medium: 14,
    large: 16,
    xlarge: 18,
    xxlarge: 20,
    title: 24,
    heading: 28,
    display: 32,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  lineHeight: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 28,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  round: 50,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const Layout = {
  window: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Default white background
  },
  contentContainer: {
    padding: Spacing.md,
  },
  formContainer: {
    backgroundColor: '#FFFFFF', // Default white card background
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    margin: Spacing.md,
    ...Shadows.medium,
  },
};

// Create a complete theme object with all possible property paths
export const theme = {
  colors: safeMerge({
    // Top-level color properties
    primary: '#4A6572',
    secondary: '#F9AA33',
    red: '#FF6B6B',
    teal: '#4ECDC4',
    white: '#FFFFFF',
    black: '#000000',
    success: '#4ECDC4',
    warning: '#F9AA33',
    error: '#FF6B6B',
    info: '#4A6572',
    
    // Direct access shortcuts
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundCard: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    textWhite: '#FFFFFF',
    border: '#E0E0E0',
    
    // Nested color properties
    gray: {
      light: '#F5F5F5',
      medium: '#E0E0E0',
      dark: '#666666',
    },
    
    text: {
      primary: '#333333',
      secondary: '#666666',
      light: '#999999',
      white: '#FFFFFF',
    },
    
    background: {
      primary: '#FFFFFF',
      secondary: '#F5F5F5',
      card: '#FFFFFF',
    },
  }, Colors),
  
  typography: safeMerge({
    // Base typography properties
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      xxlarge: 20,
      title: 24,
      heading: 28,
      display: 32,
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
    
    lineHeight: {
      small: 16,
      medium: 20,
      large: 24,
      xlarge: 28,
    },
    
    // For backward compatibility and shortcuts
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      xxlarge: 20,
      title: 24,
      heading: 28,
      display: 32,
    },
    
    weights: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      semibold: '600', // Alternative spelling
      bold: '700',
    },
    
    // Typography variants that are used in screens
    h1: {
      fontSize: 32,
      fontWeight: '700',
      lineHeight: 38
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20
    }
  }, Typography),
  
  spacing: safeMerge({
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    small: 8,
    medium: 16,
    large: 24
  }, Spacing),
  
  borderRadius: safeMerge({
    small: 4,
    medium: 8,
    large: 12,
    xlarge: 16,
    round: 50,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16
  }, BorderRadius),
  
  shadows: safeMerge({
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    }
  }, Shadows),
  
  layout: safeMerge({
    window: {
      width: '100%',
      height: '100%',
    },
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    contentContainer: {
      padding: 16,
    },
    formContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      padding: 24,
      margin: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }
  }, Layout)
};
