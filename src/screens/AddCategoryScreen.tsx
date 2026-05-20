import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../utils/api';

import Toast from 'react-native-toast-message';

const AddCategoryScreen = ({ navigation }: any) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parent, setParent] = useState<number>(0);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('products/categories', { params: { per_page: 100 } });
      return response.data;
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('products/categories', { name, description, parent });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      Toast.show({
        type: 'success',
        text1: 'Category Created',
        text2: `Successfully added ${name} to hierarchy.`,
        position: 'bottom'
      });
      navigation.goBack();
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: 'Could not communicate with the database.',
        position: 'bottom'
      });
    }
  });

  const handleSubmit = () => {
    if (!name) {
      Toast.show({
        type: 'info',
        text1: 'Name Required',
        text2: 'Please give your new category a title.',
        position: 'bottom'
      });
      return;
    }
    addCategoryMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Category</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <CustomInput
            label="Category Name"
            placeholder="e.g. Lathe Machines"
            value={name}
            onChangeText={setName}
            icon="account-tree"
          />
          
          <Text style={styles.label}>Parent Category (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            <TouchableOpacity 
              style={[styles.catChip, parent === 0 && styles.catChipActive]}
              onPress={() => setParent(0)}
            >
              <Text style={[styles.catText, parent === 0 && styles.catTextActive]}>None (Root)</Text>
            </TouchableOpacity>
            {categories?.map((cat: any) => (
              <TouchableOpacity 
                key={cat.id} 
                style={[styles.catChip, parent === cat.id && styles.catChipActive]}
                onPress={() => setParent(cat.id)}
              >
                <Text style={[styles.catText, parent === cat.id && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ marginTop: 10 }}>
            <CustomInput
              label="Description"
              placeholder="Describe this group of machines..."
              value={description}
              onChangeText={setDescription}
              // @ts-ignore
              multiline
              numberOfLines={3}
              icon="description"
            />
          </View>

          <CustomButton 
            title="CREATE CATEGORY" 
            onPress={handleSubmit} 
            loading={addCategoryMutation.isPending}
            style={styles.submitBtn}
          />
        </View>
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
  form: { gap: 4 },
  label: { fontSize: 14, fontWeight: '800', color: Colors.text, marginBottom: 12, marginLeft: 4 },
  categoryList: { marginBottom: 20 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.white, marginRight: 10, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  catTextActive: { color: Colors.white },
  submitBtn: { marginTop: 20, height: 60, borderRadius: 20 },
});

export default AddCategoryScreen;
