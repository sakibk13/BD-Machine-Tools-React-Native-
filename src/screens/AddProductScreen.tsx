import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../utils/api';

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://bdmachinetools.com';

import Toast from 'react-native-toast-message';

const AddProductScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [uploading, setLoading] = useState(false);

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('products/categories', { params: { per_page: 100 } });
      return response.data;
    },
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 4], // Square aspect ratio for machine photos
      quality: 0.7, // Slightly lower quality for faster upload
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const filename = uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
      name: filename,
      type,
    });

    try {
      console.log('Starting image upload to WordPress...');
      // Use SITE_URL to construct WP Media API endpoint
      const wpMediaUrl = `${SITE_URL}/wp-json/wp/v2/media`;
      
      const response = await fetch(wpMediaUrl, {
        method: 'POST',
        headers: {
          Authorization: api.defaults.headers.Authorization as string,
          'Accept': 'application/json',
          // Note: fetch automatically sets the boundary for multipart/form-data
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok && data.source_url) {
        console.log('Image uploaded successfully:', data.source_url);
        return { id: data.id, src: data.source_url };
      } else {
        console.error('Upload failed with status:', response.status, data);
        return null;
      }
    } catch (error) {
      console.error('Network error during image upload:', error);
      return null;
    }
  };

  const addProductMutation = useMutation({
    mutationFn: async () => {
      setLoading(true);
      let uploadedImage = null;
      if (image) {
        uploadedImage = await uploadImage(image);
      }

      const productData = {
        name,
        type: 'simple',
        sku,
        regular_price: regularPrice,
        sale_price: salePrice,
        manage_stock: true,
        stock_quantity: parseInt(stock),
        description,
        categories: selectedCategory ? [{ id: selectedCategory }] : [],
        images: uploadedImage ? [{ id: uploadedImage.id }] : [],
      };

      console.log('Creating product in WooCommerce...', productData);
      const response = await api.post('products', productData);
      return response.data;
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Toast.show({
        type: 'success',
        text1: 'Machine Added',
        text2: 'The listing has been published successfully!',
        position: 'bottom'
      });
      navigation.goBack();
    },
    onError: (error) => {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Entry Failed',
        text2: 'Please check all fields and try again.',
        position: 'bottom'
      });
      console.error(error);
    }
  });

  const handleSubmit = () => {
    if (!name || !regularPrice || !stock) {
      Toast.show({
        type: 'info',
        text1: 'Incomplete Form',
        text2: 'Model Name, Price, and Stock are required.',
        position: 'bottom'
      });
      return;
    }
    addProductMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Machine Entry</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="add-a-photo" size={40} color={Colors.border} />
              <Text style={styles.imageText}>Add Machine Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <CustomInput
            label="Model Name / Title"
            placeholder="e.g. Industrial Lathe Machine X1"
            value={name}
            onChangeText={setName}
            icon="precision-manufacturing"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.inputWithIcon}>
                <CustomInput
                  label="SKU (Model No.)"
                  placeholder="BDMT-001"
                  value={sku}
                  onChangeText={setSku}
                  icon="qr-code"
                />
                <TouchableOpacity 
                  style={styles.inputIcon}
                  onPress={() => navigation.navigate('Scanner', { onScan: (data: string) => setSku(data) })}
                >
                  <MaterialIcons name="qr-code-scanner" size={20} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomInput
                label="Stock"
                placeholder="10"
                value={stock}
                onChangeText={setStock}
                // @ts-ignore
                keyboardType="numeric"
                icon="inventory"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="Regular Price"
                placeholder="15,000"
                value={regularPrice}
                onChangeText={setRegularPrice}
                // @ts-ignore
                keyboardType="numeric"
                icon="payments"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomInput
                label="Offer Price"
                placeholder="12,000"
                value={salePrice}
                onChangeText={setSalePrice}
                // @ts-ignore
                keyboardType="numeric"
                icon="local-offer"
              />
            </View>
          </View>

          <Text style={styles.label}>Select Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            {categories?.map((cat: any) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ marginTop: 10 }}>
            <CustomInput
              label="Machine Description"
              placeholder="Enter technical specifications and details..."
              value={description}
              onChangeText={setDescription}
              // @ts-ignore
              multiline
              numberOfLines={4}
            />
          </View>

          <CustomButton 
            title={uploading ? "UPLOADING..." : "SAVE TO INVENTORY"} 
            onPress={handleSubmit} 
            loading={uploading}
            style={styles.submitBtn}
          />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 24 },
  imagePicker: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { marginTop: 10, fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  form: { gap: 4 },
  row: { flexDirection: 'row' },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    zIndex: 10,
  },
  label: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 12, marginLeft: 4 },
  categoryList: { marginBottom: 24 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  submitBtn: { marginTop: 10, height: 60, borderRadius: 20 },
});

export default AddProductScreen;
