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
import { FOOD_CATEGORIES } from '../../constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { menuItemAPI } from '../../api/foodAPI';

const AddMenuItemScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    preparationTime: '',
    ingredients: '',
    allergens: '',
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    isSpicy: false,
    customizations: '',
  });

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleBoolean = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to add an image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = () => {
    const required = ['name', 'description', 'category', 'price', 'preparationTime'];
    
    for (const field of required) {
      if (!formData[field]?.toString().trim()) {
        Alert.alert('Validation Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    if (parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Price must be greater than 0');
      return false;
    }

    if (parseInt(formData.preparationTime) <= 0) {
      Alert.alert('Validation Error', 'Preparation time must be greater than 0');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Create FormData for file upload
      const menuItemData = new FormData();
      
      // Append image if available
      if (image) {
        menuItemData.append('image', {
          uri: image.uri,
          type: 'image/jpeg',
          name: 'menu_item.jpg',
        });
      }

      // Append form data
      Object.keys(formData).forEach(key => {
        menuItemData.append(key, formData[key]);
      });

      await menuItemAPI.createMenuItem(menuItemData);
      
      Alert.alert(
        'Success',
        'Menu item added successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error creating menu item:', error);
      Alert.alert('Error', 'Failed to create menu item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImagePicker = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Item Image</Text>
      
      <TouchableOpacity style={styles.imagePickerContainer} onPress={handleImagePicker}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.selectedImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera-outline" size={32} color={theme.colors.textSecondary} />
            <Text style={styles.imagePlaceholderText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCategorySelection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Category</Text>
      <View style={styles.categoryGrid}>
        {Object.values(FOOD_CATEGORIES).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              formData.category === category && styles.selectedCategoryButton,
            ]}
            onPress={() => updateFormData('category', category)}
          >
            <Text style={[
              styles.categoryButtonText,
              formData.category === category && styles.selectedCategoryButtonText,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDietaryOptions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Dietary Information</Text>
      
      <View style={styles.dietaryGrid}>
        {[
          { key: 'isVegetarian', label: 'Vegetarian', icon: '🥬' },
          { key: 'isVegan', label: 'Vegan', icon: '🌱' },
          { key: 'isHalal', label: 'Halal', icon: '☪️' },
          { key: 'isSpicy', label: 'Spicy', icon: '🌶️' },
        ].map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.dietaryOption,
              formData[option.key] && styles.selectedDietaryOption,
            ]}
            onPress={() => toggleBoolean(option.key)}
          >
            <Text style={styles.dietaryEmoji}>{option.icon}</Text>
            <Text style={[
              styles.dietaryLabel,
              formData[option.key] && styles.selectedDietaryLabel,
            ]}>
              {option.label}
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
          <Text style={styles.headerTitle}>Add Menu Item</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Image */}
          {renderImagePicker()}

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Item Name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter item name"
              required
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your dish"
              multiline
              numberOfLines={4}
              required
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Price (RM)"
                  value={formData.price}
                  onChangeText={(value) => updateFormData('price', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  required
                />
              </View>
              
              <View style={styles.halfWidth}>
                <Input
                  label="Prep Time (mins)"
                  value={formData.preparationTime}
                  onChangeText={(value) => updateFormData('preparationTime', value)}
                  placeholder="15"
                  keyboardType="numeric"
                  required
                />
              </View>
            </View>
          </View>

          {/* Category */}
          {renderCategorySelection()}

          {/* Dietary Options */}
          {renderDietaryOptions()}

          {/* Additional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
            
            <Input
              label="Ingredients"
              value={formData.ingredients}
              onChangeText={(value) => updateFormData('ingredients', value)}
              placeholder="List main ingredients separated by commas"
              multiline
              numberOfLines={3}
            />

            <Input
              label="Allergens"
              value={formData.allergens}
              onChangeText={(value) => updateFormData('allergens', value)}
              placeholder="e.g., Contains nuts, dairy, gluten"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Customization Options"
              value={formData.customizations}
              onChangeText={(value) => updateFormData('customizations', value)}
              placeholder="e.g., Extra spicy, No onions, Add cheese"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={loading ? "Adding Item..." : "Add Menu Item"}
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
  imagePickerContainer: {
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedCategoryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  selectedCategoryButtonText: {
    color: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  dietaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  dietaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minWidth: '45%',
  },
  selectedDietaryOption: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  dietaryEmoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  dietaryLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  selectedDietaryLabel: {
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

export default AddMenuItemScreen;
