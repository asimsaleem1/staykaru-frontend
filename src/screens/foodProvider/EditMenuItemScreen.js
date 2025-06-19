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
import { foodAPI } from '../../api/foodAPI';
import { FOOD_CATEGORIES } from '../../constants';

const EditMenuItemScreen = ({ route, navigation }) => {
  const { menuItemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItem, setMenuItem] = useState(null);
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
    isGlutenFree: false,
    isSpicy: false,
    available: true,
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadMenuItem();
  }, []);

  const loadMenuItem = async () => {
    try {
      setLoading(true);
      const response = await foodAPI.getMenuItemDetails(menuItemId);
      if (response.success) {
        const item = response.data;
        setMenuItem(item);
        setFormData({
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price.toString(),
          preparationTime: item.preparationTime.toString(),
          ingredients: item.ingredients.join(', '),
          allergens: item.allergens.join(', '),
          isVegetarian: item.isVegetarian || false,
          isVegan: item.isVegan || false,
          isGlutenFree: item.isGlutenFree || false,
          isSpicy: item.isSpicy || false,
          available: item.available !== false,
        });
        setImage(item.image ? { uri: item.image } : null);
      } else {
        Alert.alert('Error', 'Failed to load menu item details');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu item details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price.trim() || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }

    if (!formData.preparationTime.trim() || isNaN(formData.preparationTime) || parseInt(formData.preparationTime) <= 0) {
      newErrors.preparationTime = 'Valid preparation time is required';
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Ingredients are required';
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

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
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
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.cancelled && result.assets && result.assets[0]) {
      setImage({ uri: result.assets[0].uri, isNew: true });
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setImage(null)
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        preparationTime: parseInt(formData.preparationTime),
        ingredients: formData.ingredients.split(',').map(item => item.trim()).filter(item => item),
        allergens: formData.allergens ? formData.allergens.split(',').map(item => item.trim()).filter(item => item) : [],
        isVegetarian: formData.isVegetarian,
        isVegan: formData.isVegan,
        isGlutenFree: formData.isGlutenFree,
        isSpicy: formData.isSpicy,
        available: formData.available,
      };

      // Handle image upload
      if (image && image.isNew) {
        // In a real app, you would upload this image first and get its URL
        updateData.image = image.uri;
      } else if (image) {
        updateData.image = image.uri;
      }

      const response = await foodAPI.updateMenuItem(menuItemId, updateData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Menu item updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      Alert.alert('Error', 'Failed to update menu item. Please try again.');
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
          <Text style={styles.headerTitle}>Edit Menu Item</Text>
        </View>

        <View style={styles.content}>
          {/* Image Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photo</Text>
            <View style={styles.imageContainer}>
              {image ? (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: image.uri }} style={styles.menuItemImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={removeImage}
                  >
                    <Ionicons name="close" size={20} color={theme.colors.white} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePlaceholder} onPress={pickImage}>
                  <Ionicons name="camera" size={48} color={theme.colors.primary} />
                  <Text style={styles.imagePlaceholderText}>Add Photo</Text>
                </TouchableOpacity>
              )}
              {image && (
                <Button
                  title="Change Photo"
                  onPress={pickImage}
                  variant="outline"
                  style={styles.changeImageButton}
                />
              )}
            </View>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <Input
              label="Item Name"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              error={errors.name}
              placeholder="Enter item name"
            />

            <Input
              label="Description"
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              error={errors.description}
              placeholder="Describe your menu item"
              multiline
              numberOfLines={3}
            />

            <View style={styles.categoryContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.categoryOptions}>
                  {FOOD_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryOption,
                        formData.category === category && styles.categoryOptionSelected
                      ]}
                      onPress={() => handleInputChange('category', category)}
                    >
                      <Text style={[
                        styles.categoryOptionText,
                        formData.category === category && styles.categoryOptionTextSelected
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input
                  label="Price (RM)"
                  value={formData.price}
                  onChangeText={(value) => handleInputChange('price', value)}
                  error={errors.price}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfWidth}>
                <Input
                  label="Prep Time (min)"
                  value={formData.preparationTime}
                  onChangeText={(value) => handleInputChange('preparationTime', value)}
                  error={errors.preparationTime}
                  placeholder="15"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Ingredients & Allergens */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients & Allergens</Text>
            
            <Input
              label="Ingredients"
              value={formData.ingredients}
              onChangeText={(value) => handleInputChange('ingredients', value)}
              error={errors.ingredients}
              placeholder="Rice, chicken, vegetables (separate with commas)"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Allergens (Optional)"
              value={formData.allergens}
              onChangeText={(value) => handleInputChange('allergens', value)}
              placeholder="Nuts, dairy, gluten (separate with commas)"
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Dietary Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dietary Information</Text>
            
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => handleToggle('isVegetarian')}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="leaf" size={20} color={theme.colors.success} />
                  <Text style={styles.toggleLabel}>Vegetarian</Text>
                </View>
                <View style={[
                  styles.toggle,
                  formData.isVegetarian && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleCircle,
                    formData.isVegetarian && styles.toggleCircleActive
                  ]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => handleToggle('isVegan')}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="leaf" size={20} color={theme.colors.success} />
                  <Text style={styles.toggleLabel}>Vegan</Text>
                </View>
                <View style={[
                  styles.toggle,
                  formData.isVegan && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleCircle,
                    formData.isVegan && styles.toggleCircleActive
                  ]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => handleToggle('isGlutenFree')}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="medical" size={20} color={theme.colors.info} />
                  <Text style={styles.toggleLabel}>Gluten Free</Text>
                </View>
                <View style={[
                  styles.toggle,
                  formData.isGlutenFree && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleCircle,
                    formData.isGlutenFree && styles.toggleCircleActive
                  ]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toggleItem}
                onPress={() => handleToggle('isSpicy')}
              >
                <View style={styles.toggleLeft}>
                  <Ionicons name="flame" size={20} color={theme.colors.error} />
                  <Text style={styles.toggleLabel}>Spicy</Text>
                </View>
                <View style={[
                  styles.toggle,
                  formData.isSpicy && styles.toggleActive
                ]}>
                  <View style={[
                    styles.toggleCircle,
                    formData.isSpicy && styles.toggleCircleActive
                  ]} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            
            <TouchableOpacity
              style={styles.toggleItem}
              onPress={() => handleToggle('available')}
            >
              <View style={styles.toggleLeft}>
                <Ionicons 
                  name={formData.available ? "checkmark-circle" : "close-circle"} 
                  size={20} 
                  color={formData.available ? theme.colors.success : theme.colors.error} 
                />
                <Text style={styles.toggleLabel}>
                  {formData.available ? 'Available' : 'Not Available'}
                </Text>
              </View>
              <View style={[
                styles.toggle,
                formData.available && styles.toggleActive
              ]}>
                <View style={[
                  styles.toggleCircle,
                  formData.available && styles.toggleCircleActive
                ]} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={saving ? "Updating..." : "Update Menu Item"}
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  menuItemImage: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primaryLight,
    marginBottom: theme.spacing.md,
  },
  imagePlaceholderText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.sm,
  },
  changeImageButton: {
    width: 120,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  categoryContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  categoryOptions: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.xs,
  },
  categoryOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryOptionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
  },
  categoryOptionTextSelected: {
    color: theme.colors.white,
  },
  toggleContainer: {
    marginTop: theme.spacing.sm,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.white,
    alignSelf: 'flex-start',
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
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

export default EditMenuItemScreen;
