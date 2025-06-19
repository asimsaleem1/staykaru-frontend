import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  TextInputProps
} from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  error, 
  value, 
  onChangeText, 
  secureTextEntry, 
  rightIcon,
  ...rest 
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, error ? styles.inputError : null, rightIcon ? styles.inputWithIcon : null]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          {...rest}
        />
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

interface FormButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

const FormButton: React.FC<FormButtonProps> = ({ 
  title, 
  onPress, 
  disabled = false, 
  loading = false,
  style 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled || loading ? styles.buttonDisabled : null,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <Text style={styles.buttonText}>
        {loading ? 'Please wait...' : title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  rightIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    backgroundColor: '#4b7bec',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export { FormInput, FormButton };
