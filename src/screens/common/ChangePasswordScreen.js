import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { userAPI } from '../../api/commonAPI';

const ChangePasswordScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword) {
      Alert.alert('Validation Error', 'Current password is required');
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert('Validation Error', 'New password is required');
      return false;
    }

    if (formData.newPassword.length < 8) {
      Alert.alert('Validation Error', 'New password must be at least 8 characters long');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      Alert.alert('Validation Error', 'New password must be different from current password');
      return false;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      Alert.alert(
        'Weak Password',
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
        const response = await userAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      Alert.alert(
        'Success',
        response.message || 'Password changed successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error changing password:', error);
        if (error.response?.status === 400 && error.response?.data?.message?.includes('incorrect')) {
        Alert.alert('Error', 'Current password is incorrect');
      } else if (error.response?.status === 400 && error.response?.data?.details) {
        Alert.alert('Error', error.response.data.details.join('\n'));
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordStrength = () => {
    const password = formData.newPassword;
    if (!password) return null;

    const checks = [
      { test: password.length >= 8, label: 'At least 8 characters' },
      { test: /[A-Z]/.test(password), label: 'One uppercase letter' },
      { test: /[a-z]/.test(password), label: 'One lowercase letter' },
      { test: /\d/.test(password), label: 'One number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'One special character' },
    ];

    return (
      <View style={styles.passwordStrength}>
        <Text style={styles.strengthTitle}>Password Requirements:</Text>
        {checks.map((check, index) => (
          <View key={index} style={styles.strengthCheck}>
            <Ionicons
              name={check.test ? 'checkmark-circle' : 'close-circle'}
              size={16}
              color={check.test ? theme.colors.success : theme.colors.error}
            />
            <Text style={[
              styles.strengthLabel,
              { color: check.test ? theme.colors.success : theme.colors.error }
            ]}>
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <View style={styles.content}>
            <Text style={styles.description}>
              Enter your current password and choose a new secure password
            </Text>

            <View style={styles.inputContainer}>
              <Input
                label="Current Password"
                value={formData.currentPassword}
                onChangeText={(value) => updateFormData('currentPassword', value)}
                placeholder="Enter your current password"
                secureTextEntry={!showPasswords.current}
                required
                rightIcon={
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('current')}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.current ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                label="New Password"
                value={formData.newPassword}
                onChangeText={(value) => updateFormData('newPassword', value)}
                placeholder="Enter your new password"
                secureTextEntry={!showPasswords.new}
                required
                rightIcon={
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('new')}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.new ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {renderPasswordStrength()}

            <View style={styles.inputContainer}>
              <Input
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                placeholder="Confirm your new password"
                secureTextEntry={!showPasswords.confirm}
                required
                rightIcon={
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('confirm')}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showPasswords.confirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.text}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            <View style={styles.securityTips}>
              <Text style={styles.tipsTitle}>Security Tips:</Text>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                <Text style={styles.tipText}>Use a unique password for your StayKaru account</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                <Text style={styles.tipText}>Don't share your password with anyone</Text>
              </View>
              <View style={styles.tip}>
                <Ionicons name="shield-checkmark" size={16} color={theme.colors.primary} />
                <Text style={styles.tipText}>Consider using a password manager</Text>
              </View>
            </View>

            <Button
              title={loading ? "Changing Password..." : "Change Password"}
              onPress={handleChangePassword}
              disabled={loading}
              style={styles.changeButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
  },
  passwordStrength: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  strengthTitle: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  strengthCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xxs,
  },
  strengthLabel: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
  },
  securityTips: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipsTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xxs,
  },
  tipText: {
    marginLeft: theme.spacing.xs,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  changeButton: {
    marginTop: theme.spacing.md,
  },
});
