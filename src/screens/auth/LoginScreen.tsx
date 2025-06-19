import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, FormButton } from '../../components/ui/FormElements';
import { useAuth } from '../../context/AuthContext';
import { AuthNavigationProp } from '../../types/navigation.types';

// Define types for form values
interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {    setError('');
    try {
      const result = await login(values);
      // Optionally save credentials if rememberMe is checked
      // ...implement rememberMe logic with AsyncStorage if needed
      // Navigation handled by AuthContext/AppNavigator
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >

          <View style={styles.header}>
            {/* Logo and Welcome Text */}
            <Image source={require('../../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Welcome to StayKaru</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Formik
            initialValues={{ email: '', password: '', rememberMe: false }}
            validationSchema={LoginSchema}
            onSubmit={handleLogin}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <FormInput
                  label="Email"
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                />
                <FormInput
                  label="Password"
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password ? errors.password : undefined}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  }
                />                <View style={styles.optionsRow}>
                  <TouchableOpacity 
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.rememberMeText}>Remember Me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
                <FormButton
                  title="Sign In"
                  onPress={handleSubmit}
                  disabled={isLoading}
                  loading={isLoading}
                />
                {/* Social login buttons (UI only) */}                <View style={styles.socialLogin}>
                  <Text style={styles.orText}>Or continue with</Text>
                  <View style={styles.socialButtons}>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-google" size={24} color="#DB4437" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-facebook" size={24} color="#4267B2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
    alignSelf: 'center',
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  forgotPassword: {
    color: '#2196F3',
    fontWeight: '500',
    fontSize: 15,
  },
  socialLogin: {
    marginTop: 18,
    alignItems: 'center',
  },
  orText: {
    color: '#7f8c8d',
    marginBottom: 8,
    fontSize: 15,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 10,
    marginHorizontal: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 16,
  },  footerLink: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 15,
    color: '#333',
  },
});

export default LoginScreen;
