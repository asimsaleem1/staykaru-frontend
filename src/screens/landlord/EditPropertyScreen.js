import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { theme } from '../../styles/theme';
import { accommodationAPI } from '../../api/accommodationAPI';
import { ACCOMMODATION_TYPES, ACCOMMODATION_AMENITIES } from '../../constants';

const EditPropertyScreen = ({ route, navigation }) => {
  const { propertyId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    address: '',
    city: '',
    state: '',
    price: '',
    rooms: '',
    bathrooms: '',
    amenities: [],
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProperty();
  }, []);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await accommodationAPI.getPropertyDetails(propertyId);
      if (response.success) {
        const prop = response.data;
        setProperty(prop);
        setFormData({
          title: prop.title,
          description: prop.description,
          type: prop.type,
          address: prop.address,
          city: prop.city,
          state: prop.state,
          price: prop.price.toString(),
          rooms: prop.rooms.toString(),
          bathrooms: prop.bathrooms.toString(),
          amenities: prop.amenities || [],
        });
        setImages(prop.images || []);
      } else {
        Alert.alert('Error', 'Failed to load property details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load property details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Property title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.type) {
      newErrors.type = 'Property type is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.rooms.trim() || isNaN(formData.rooms) || parseInt(formData.rooms) <= 0) {
      newErrors.rooms = 'Valid number of rooms is required';
    }

    if (!formData.bathrooms.trim() || isNaN(formData.bathrooms) || parseInt(formData.bathrooms) <= 0) {
      newErrors.bathrooms = 'Valid number of bathrooms is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
      setImages(prev => [...prev, { uri: result.assets[0].uri, isNew: true }]);
    }
  };

  const removeImage = (index) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImages(prev => prev.filter((_, i) => i !== index));
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors and try again.');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        price: parseFloat(formData.price),
        rooms: parseInt(formData.rooms),
        bathrooms: parseInt(formData.bathrooms),
        amenities: formData.amenities,
        images: images.filter(img => !img.isNew).map(img => img.uri),
      };

      // Handle new images upload
      const newImages = images.filter(img => img.isNew);
      if (newImages.length > 0) {
        // In a real app, you would upload these images first and get their URLs
        updateData.newImages = newImages.map(img => img.uri);
      }

      const response = await accommodationAPI.updateProperty(propertyId, updateData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Property updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error updating property:', error);
      Alert.alert('Error', 'Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Property</Text>
        </View>

        <View style={styles.content}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Property Title"
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
              error={errors.title}
              placeholder="Enter property title"
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={errors.description}
              placeholder="Describe your property"
              multiline
              numberOfLines={4}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Property Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.typeOptions}>
                  {ACCOMMODATION_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.typeOption,
                        formData.type === type.value && styles.typeOptionSelected
                      ]}
                      onPress={() => handleInputChange('type', type.value)}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type.value && styles.typeOptionTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            
            <Input
              label="Address"
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              error={errors.address}
              placeholder="Enter property address"
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="City"
                  value={formData.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  error={errors.city}
                  placeholder="City"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="State"
                  value={formData.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  error={errors.state}
                  placeholder="State"
                />
              </View>
            </View>
          </View>

          {/* Property Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Details</Text>
            
            <View style={styles.row}>
              <View style={styles.thirdWidth}>
                <Input
                  label="Price (RM)"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  error={errors.price}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thirdWidth}>
                <Input
                  label="Rooms"
                  value={formData.rooms}
                  onChangeText={(value) => handleInputChange('rooms', value)}
                  error={errors.rooms}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.thirdWidth}>
                <Input
                  label="Bathrooms"
                  value={formData.bathrooms}
                  onChangeText={(value) => handleInputChange('bathrooms', value)}
                  error={errors.bathrooms}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesContainer}>
              {ACCOMMODATION_AMENITIES.map((amenity) => (
                <TouchableOpacity
                  key={amenity.value}
                  style={[
                    styles.amenityChip,
                    formData.amenities.includes(amenity.value) && styles.amenityChipSelected
                  ]}
                  onPress={() => handleAmenityToggle(amenity.value)}
                >
                  <Ionicons 
                    name={amenity.icon} 
                    size={16} 
                    color={formData.amenities.includes(amenity.value) ? 
                      theme.colors.white : theme.colors.text} 
                    style={styles.amenityIcon}
                  />
                  <Text style={[
                    styles.amenityText,
                    formData.amenities.includes(amenity.value) && styles.amenityTextSelected
                  ]}>
                    {amenity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image 
                      source={{ uri: image.uri || image }} 
                      style={styles.propertyImage} 
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={16} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
                
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={pickImage}
                >
                  <Ionicons name="camera" size={32} color={theme.colors.primary} />
                  <Text style={styles.addImageText}>Add Image</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? "Updating..." : "Update Property"}
          onPress={handleSubmit}
          disabled={saving}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  thirdWidth: {
    width: '32%',
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  typeOptions: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
  },
  typeOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeOptionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  typeOptionTextSelected: {
    color: theme.colors.white,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.xs,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  amenityChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  amenityIcon: {
    marginRight: theme.spacing.xs,
  },
  amenityText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  amenityTextSelected: {
    color: theme.colors.white,
  },
  imagesContainer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
  },
  imageContainer: {
    position: 'relative',
    marginRight: theme.spacing.sm,
  },
  propertyImage: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButton: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
  },
  addImageText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default EditPropertyScreen;
