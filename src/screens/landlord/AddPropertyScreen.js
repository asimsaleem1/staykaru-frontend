import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../styles/theme';
import { ACCOMMODATION_TYPES, AMENITIES } from '../../constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { accommodationAPI } from '../../api/accommodationAPI';

const AddPropertyScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    location: '',
    address: '',
    pricePerMonth: '',
    pricePerNight: '',
    capacity: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    rules: '',
    contactInfo: {
      phone: '',
      email: '',
    },
  });

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [16, 9],
      });

      if (!result.canceled) {
        setImages(prev => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateForm = () => {
    const required = ['name', 'description', 'type', 'location', 'address', 'pricePerMonth', 'capacity'];
    
    for (const field of required) {
      if (!formData[field]?.toString().trim()) {
        Alert.alert('Validation Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (images.length === 0) {
      Alert.alert('Validation Error', 'Please add at least one image');
      return false;
    }

    if (parseFloat(formData.pricePerMonth) <= 0) {
      Alert.alert('Validation Error', 'Price must be greater than 0');
      return false;
    }

    if (parseInt(formData.capacity) <= 0) {
      Alert.alert('Validation Error', 'Capacity must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create FormData for file upload
      const propertyData = new FormData();
      
      // Append images
      images.forEach((image, index) => {
        propertyData.append('images', {
          uri: image.uri,
          type: 'image/jpeg',
          name: `property_${index}.jpg`,
        });
      });

      // Append form data
      Object.keys(formData).forEach(key => {
        if (key === 'contactInfo') {
          propertyData.append(key, JSON.stringify(formData[key]));
        } else if (key === 'amenities') {
          propertyData.append(key, JSON.stringify(formData[key]));
        } else {
          propertyData.append(key, formData[key]);
        }
      });

      await accommodationAPI.createProperty(propertyData);
      
      Alert.alert(
        'Success',
        'Property added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating property:', error);
      Alert.alert('Error', 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Property Images</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
        <TouchableOpacity style={styles.addImageButton} onPress={handleImagePicker}>
          <Ionicons name="camera-outline" size={32} color={theme.colors.textSecondary} />
          <Text style={styles.addImageText}>Add Photos</Text>
        </TouchableOpacity>
        
        {images.map((image, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: image.uri }} style={styles.propertyImage} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => removeImage(index)}
            >
              <Ionicons name="close" size={16} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderTypeSelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Property Type</Text>
      <View style={styles.typeGrid}>
        {Object.values(ACCOMMODATION_TYPES).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              formData.type === type && styles.selectedTypeButton,
            ]}
            onPress={() => updateFormData('type', type)}
          >
            <Text style={[
              styles.typeButtonText,
              formData.type === type && styles.selectedTypeButtonText,
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAmenities = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {Object.values(AMENITIES).map((amenity) => (
          <TouchableOpacity
            key={amenity}
            style={[
              styles.amenityButton,
              formData.amenities.includes(amenity) && styles.selectedAmenityButton,
            ]}
            onPress={() => toggleAmenity(amenity)}
          >
            <Text style={[
              styles.amenityButtonText,
              formData.amenities.includes(amenity) && styles.selectedAmenityButtonText,
            ]}>
              {amenity}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Property</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Images */}
          {renderImagePicker()}

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Property Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter property name"
              required
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your property"
              multiline
              numberOfLines={4}
              required
            />

            <Input
              label="Location/Area"
              value={formData.location}
              onChangeText={(value) => updateFormData('location', value)}
              placeholder="e.g., Bangi, Kajang, KL"
              required
            />

            <Input
              label="Full Address"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="Complete address with postcode"
              multiline
              numberOfLines={3}
              required
            />
          </View>

          {/* Property Type */}
          {renderTypeSelection()}

          {/* Pricing & Capacity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing & Capacity</Text>
            
            <Input
              label="Price per Month (RM)"
              value={formData.pricePerMonth}
              onChangeText={(value) => updateFormData('pricePerMonth', value)}
              placeholder="0"
              keyboardType="numeric"
              required
            />

            <Input
              label="Price per Night (RM)"
              value={formData.pricePerNight}
              onChangeText={(value) => updateFormData('pricePerNight', value)}
              placeholder="0 (optional)"
              keyboardType="numeric"
            />

            <Input
              label="Maximum Capacity"
              value={formData.capacity}
              onChangeText={(value) => updateFormData('capacity', value)}
              placeholder="Number of people"
              keyboardType="numeric"
              required
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Bedrooms"
                  value={formData.bedrooms}
                  onChangeText={(value) => updateFormData('bedrooms', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.halfWidth}>
                <Input
                  label="Bathrooms"
                  value={formData.bathrooms}
                  onChangeText={(value) => updateFormData('bathrooms', value)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Amenities */}
          {renderAmenities()}

          {/* Rules & Contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            <Input
              label="House Rules"
              value={formData.rules}
              onChangeText={(value) => updateFormData('rules', value)}
              placeholder="Any specific rules or requirements"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Contact Phone"
              value={formData.contactInfo.phone}
              onChangeText={(value) => updateFormData('contactInfo.phone', value)}
              placeholder="Your contact number"
              keyboardType="phone-pad"
            />

            <Input
              label="Contact Email"
              value={formData.contactInfo.email}
              onChangeText={(value) => updateFormData('contactInfo.email', value)}
              placeholder="Your contact email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={loading ? "Creating Property..." : "Add Property"}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
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
  form: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  imageContainer: {
    flexDirection: 'row',
  },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  addImageText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  propertyImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedTypeButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  selectedTypeButtonText: {
    color: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  amenityButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedAmenityButton: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  amenityButtonText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text,
  },
  selectedAmenityButtonText: {
    color: theme.colors.white,
  },
  submitSection: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default AddPropertyScreen;
