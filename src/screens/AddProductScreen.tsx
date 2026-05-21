import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../utils/api';
// @ts-ignore
import { EXPO_PUBLIC_SITE_URL } from '@env';

const SITE_URL = EXPO_PUBLIC_SITE_URL || process.env.EXPO_PUBLIC_SITE_URL || 'https://bdmachinetools.com';

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
      aspect: [4, 3], 
      quality: 0.8,
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
      const wpMediaUrl = `${SITE_URL}/wp-json/wp/v2/media`;
      const response = await fetch(wpMediaUrl, {
        method: 'POST',
        headers: {
          Authorization: api.defaults.headers.Authorization as string,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.id) {
        return { id: data.id, src: data.source_url };
      }
      return null;
    } catch (error) {
      console.error('Image upload error:', error);
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

      const response = await api.post('products', productData);
      return response.data;
    },
    onSuccess: () => {
      setLoading(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Toast.show({
        type: 'success',
        text1: 'Product Saved',
        text2: 'The machine is now live in inventory.',
        position: 'bottom'
      });
      navigation.goBack();
    },
    onError: (error) => {
      setLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: 'Please verify all specifications.',
        position: 'bottom'
      });
    }
  });

  const handleSubmit = () => {
    if (!name || !regularPrice || !stock) {
      Toast.show({
        type: 'info',
        text1: 'Required Info',
        text2: 'Name, Price, and Stock are mandatory.',
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
          <MaterialIcons name="arrow-back-ios" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Machine</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="contain" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.pickerIconCircle}>
                <MaterialIcons name="add-photo-alternate" size={32} color={Colors.accent} />
              </View>
              <Text style={styles.imageText}>Upload Product Photo</Text>
              <Text style={styles.imageSubtext}>4:3 Aspect Ratio Recommended</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <CustomInput
            label="Machine Model / Name"
            placeholder="e.g. CNC Lathe Professional v4"
            value={name}
            onChangeText={setName}
            icon="precision-manufacturing"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.inputWithIcon}>
                <CustomInput
                  label="SKU ID"
                  placeholder="BDMT-001"
                  value={sku}
                  onChangeText={setSku}
                  icon="tag"
                />
                <TouchableOpacity 
                  style={styles.inputIcon}
                  onPress={() => navigation.navigate('Scanner', { onScan: (data: string) => setSku(data) })}
                >
                  <MaterialIcons name="qr-code-scanner" size={18} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomInput
                label="Units in Stock"
                placeholder="0"
                value={stock}
                onChangeText={setStock}
                // @ts-ignore
                keyboardType="numeric"
                icon="inventory-2"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <CustomInput
                label="Base Price"
                placeholder="0"
                value={regularPrice}
                onChangeText={setRegularPrice}
                // @ts-ignore
                keyboardType="numeric"
                icon="account-balance-wallet"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <CustomInput
                label="Discount Price"
                placeholder="0"
                value={salePrice}
                onChangeText={setSalePrice}
                // @ts-ignore
                keyboardType="numeric"
                icon="local-offer"
              />
            </View>
          </View>

          <Text style={styles.label}>Categorization</Text>
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
              label="Technical Description"
              placeholder="Enter machine specifications..."
              value={description}
              onChangeText={setDescription}
              // @ts-ignore
              multiline
              numberOfLines={4}
            />
          </View>

          <CustomButton 
            title={uploading ? "SAVING..." : "ADD PRODUCT"} 
            onPress={handleSubmit} 
            loading={uploading}
            style={styles.submitBtn}
          />
        </View>
        <View style={{ height: 60 }} />
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
  headerTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  scrollContent: { padding: 24 },
  imagePicker: {
    width: '100%',
    height: 220,
    borderRadius: 32,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center', padding: 20 },
  pickerIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.accent + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  imageText: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  imageSubtext: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  form: { gap: 6 },
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
    backgroundColor: Colors.card,
    borderRadius: 12,
    zIndex: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { fontSize: 13, fontWeight: '800', color: Colors.accent, marginBottom: 14, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  categoryList: { marginBottom: 24 },
  catChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, backgroundColor: Colors.white, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  catText: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  submitBtn: { marginTop: 15, height: 64, borderRadius: 20, shadowColor: Colors.accent, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
});

export default AddProductScreen;
