import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { theme as importedTheme } from '../../styles/theme';
import { accommodationAPI, bookingAPI } from '../../api/accommodationAPI';
import { ACCOMMODATION_FEATURES } from '../../constants';

// Fallback theme object in case the imported one is undefined
const theme = importedTheme || {
  colors: {
    primary: '#4A6572',
    secondary: '#F9AA33',
    white: '#FFFFFF',
    background: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundCard: '#FFFFFF',
    text: {
      primary: '#333333',
      secondary: '#666666',
      light: '#999999',
    },
    gray: {
      light: '#F5F5F5',
      medium: '#E0E0E0',
      dark: '#666666',
    },
    success: '#4ECDC4',
  },
  typography: {
    fontSize: {
      small: 12,
      medium: 14,
      large: 16,
      xlarge: 18,
      title: 24,
      heading: 28,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semiBold: '600',
      bold: '700',
    },
    lineHeight: {
      large: 24,
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    medium: 8,
  },
  shadows: {
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  }
};

console.log("Theme in BookingFormScreen:", theme);

const BookingFormScreen = ({ route, navigation }) => {
  const { accommodation } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    checkInDate: new Date(),
    checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    guests: 1,
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    calculateTotalCost();
  }, [formData.checkInDate, formData.checkOutDate, formData.guests]);

  const calculateTotalCost = () => {
    const days = Math.ceil(
      (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
    );
    if (days > 0) {
      setTotalCost(days * accommodation.price * formData.guests);
    }
  };

  const handleDateChange = (event, selectedDate, type) => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        [type]: selectedDate,
      }));
    }
    if (type === 'checkInDate') {
      setShowCheckInPicker(false);
    } else {
      setShowCheckOutPicker(false);
    }
  };

  const validateForm = () => {
    if (formData.checkOutDate <= formData.checkInDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date');
      return false;
    }
    if (formData.guests < 1 || formData.guests > accommodation.maxGuests) {
      Alert.alert(
        'Invalid Guest Count',
        `Number of guests must be between 1 and ${accommodation.maxGuests}`
      );
      return false;
    }
    if (!formData.emergencyContact.trim()) {
      Alert.alert('Missing Information', 'Emergency contact name is required');
      return false;
    }
    if (!formData.emergencyPhone.trim()) {
      Alert.alert('Missing Information', 'Emergency contact phone is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const bookingData = {
        accommodationId: accommodation._id,
        checkInDate: formData.checkInDate.toISOString(),
        checkOutDate: formData.checkOutDate.toISOString(),
        guests: formData.guests,
        totalCost,
        specialRequests: formData.specialRequests,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
      };

      const response = await bookingAPI.create(bookingData);
      
      Alert.alert(
        'Booking Submitted',
        'Your booking request has been submitted. You will receive a confirmation shortly.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('PaymentScreen', { 
              booking: response.data,
              accommodation 
            }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Book {accommodation.title}</Text>
          <Text style={styles.subtitle}>{accommodation.location}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Details</Text>
          
          <View style={styles.row}>
            <View style={styles.dateContainer}>
              <Text style={styles.label}>Check-in Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.checkInDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateContainer}>
              <Text style={styles.label}>Check-out Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Text style={styles.dateText}>
                  {formData.checkOutDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Guests</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.guests}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, guests: value }))
                }
                style={styles.picker}
              >
                {Array.from({ length: accommodation.maxGuests }, (_, i) => (
                  <Picker.Item key={i + 1} label={`${i + 1} Guest${i > 0 ? 's' : ''}`} value={i + 1} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <Input
            label="Emergency Contact Name"
            value={formData.emergencyContact}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, emergencyContact: text }))
            }
            placeholder="Full name"
            required
          />

          <Input
            label="Emergency Contact Phone"
            value={formData.emergencyPhone}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, emergencyPhone: text }))
            }
            placeholder="+1234567890"
            keyboardType="phone-pad"
            required
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Input
            value={formData.specialRequests}
            onChangeText={(text) =>
              setFormData(prev => ({ ...prev, specialRequests: text }))
            }
            placeholder="Any special requests or requirements..."
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Property:</Text>
            <Text style={styles.summaryValue}>{accommodation.title}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>
              {Math.ceil((formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24))} nights
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests:</Text>
            <Text style={styles.summaryValue}>{formData.guests}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate per night:</Text>
            <Text style={styles.summaryValue}>${accommodation.price}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Cost:</Text>
            <Text style={styles.totalValue}>${totalCost}</Text>
          </View>
        </View>

        <Button
          title="Proceed to Payment"
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </ScrollView>

      {showCheckInPicker && (
        <DateTimePicker
          value={formData.checkInDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, date) => handleDateChange(event, date, 'checkInDate')}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={formData.checkOutDate}
          mode="date"
          display="default"
          minimumDate={new Date(formData.checkInDate.getTime() + 24 * 60 * 60 * 1000)}
          onChange={(event, date) => handleDateChange(event, date, 'checkOutDate')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  dateContainer: {
    flex: 0.48,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  dateText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  picker: {
    height: 50,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  totalValue: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  submitButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
});

export default BookingFormScreen;
