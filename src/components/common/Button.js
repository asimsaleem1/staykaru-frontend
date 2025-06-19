import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../../styles/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  style,
  textStyle,
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[`button_${variant}`], styles[`button_${size}`]];
    if (disabled) baseStyle.push(styles.button_disabled);
    if (style) baseStyle.push(style);
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`text_${variant}`], styles[`text_${size}`]];
    if (disabled) baseStyle.push(styles.text_disabled);
    if (textStyle) baseStyle.push(textStyle);
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      {...props}
    >      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? theme.colors.white : theme.colors.primary} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title || 'Button'}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variants
  button_primary: {
    backgroundColor: theme.colors.primary,
  },
  button_secondary: {
    backgroundColor: theme.colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_danger: {
    backgroundColor: theme.colors.red,
  },
  
  // Sizes
  button_small: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  button_medium: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 50,
  },
  button_large: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Disabled state
  button_disabled: {
    opacity: 0.6,
  },
  
  // Text styles
  text: {
    fontWeight: theme.typography.fontWeight.semiBold,
    textAlign: 'center',
  },
  
  // Text variants
  text_primary: {
    color: theme.colors.white,
  },
  text_secondary: {
    color: theme.colors.text.primary,
  },
  text_outline: {
    color: theme.colors.primary,
  },
  text_ghost: {
    color: theme.colors.primary,
  },
  text_danger: {
    color: theme.colors.white,
  },
  
  // Text sizes
  text_small: {
    fontSize: theme.typography.fontSize.medium,
  },
  text_medium: {
    fontSize: theme.typography.fontSize.large,
  },
  text_large: {
    fontSize: theme.typography.fontSize.xlarge,
  },
  
  // Text disabled
  text_disabled: {
    opacity: 0.8,
  },
});

export default Button;
