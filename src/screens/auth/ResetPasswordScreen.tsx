import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { FormInput, FormButton } from '../../components/ui/FormElements';
import { useAuth } from '../../context/AuthContext';
import { AuthNavigationProp } from '../../types/navigation.types';

interface ResetPasswordRouteParams {
  token?: string;
  email?: string;
}

const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ResetPasswordScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute();
  const { resetPassword, isLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const params = route.params as ResetPasswordRouteParams || {};
  const { token, email } = params;

  useEffect(() => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleResetPassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    setError('');
    setSuccess(false);
    
    try {
      await resetPassword(token, values.newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    }
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          <Text style={styles.successTitle}>Password Reset!</Text>
          <Text style={styles.successMessage}>
            Your password has been successfully reset. 
            You can now sign in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backButtonText}>Sign In Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
            <TouchableOpacity
              style={styles.backIcon}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="arrow-back" size={24} color="#2196F3" />
            </TouchableOpacity>
            
            <Image source={require('../../../assets/logo.png')} style={styles.logo} />
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below.
            </Text>
            {email && (
              <Text style={styles.emailInfo}>
                Resetting password for: {email}
              </Text>
            )}
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Formik
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleResetPassword}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View style={styles.form}>
                <FormInput
                  label="New Password"
                  placeholder="Enter your new password"
                  secureTextEntry
                  value={values.newPassword}
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                />

                <FormInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  secureTextEntry
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : undefined}
                />

                <FormButton
                  title="Reset Password"
                  onPress={handleSubmit}
                  disabled={isLoading || !token}
                  loading={isLoading}
                />
              </View>
            )}
          </Formik>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
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
  header: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 10,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emailInfo: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 8,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    fontSize: 14,
  },
  form: {
    marginBottom: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  footerLink: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 20,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  backButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;
