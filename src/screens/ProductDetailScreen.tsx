import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, Share, ActivityIndicator, Modal } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import api from '../utils/api';
// @ts-ignore
import { SITE_URL } from '@env';

import Toast from 'react-native-toast-message';

const ProductDetailScreen = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const queryClient = useQueryClient();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get(`products/${productId}`);
      return response.data;
    },
  });

  const handleShare = async () => {
    if (!product) return;
    try {
      const message = `Check out this machine: ${product.name}\nSKU: ${product.sku || 'N/A'}\nPrice: ৳${parseFloat(product.price).toLocaleString()}\nVisit: ${SITE_URL}/?p=${product.id}`;
      await Share.share({
        message,
        url: `${SITE_URL}/?p=${product.id}`,
        title: product.name,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Sharing Failed',
        text2: error.message,
        position: 'bottom'
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`products/${productId}`, { params: { force: true } });
    },
    onSuccess: () => {
      setDeleteModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      Toast.show({
        type: 'success',
        text1: 'Machine Deleted',
        text2: 'The listing has been removed from live site.',
        position: 'bottom'
      });
      navigation.goBack();
    },
    onError: () => {
      setDeleteModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: 'Machine could not be removed.',
        position: 'bottom'
      });
    }
  });

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  if (isLoading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageHeader}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.headerImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImg}>
              <MaterialIcons name="settings-input-component" size={80} color={Colors.border} />
            </View>
          )}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <MaterialIcons name="share" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{product.categories[0]?.name}</Text>
              <Text style={styles.title}>{product.name}</Text>
              <Text style={styles.sku}>Model: {product.sku || 'N/A'}</Text>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.priceValue}>৳{parseFloat(product.price).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: product.stock_status === 'instock' ? Colors.success + '15' : Colors.error + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: product.stock_status === 'instock' ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusText, { color: product.stock_status === 'instock' ? Colors.success : Colors.error }]}>
                {product.stock_status === 'instock' ? 'IN STOCK' : 'OUT OF STOCK'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description?.replace(/<[^>]*>?/gm, '') || 'No description available for this machine.'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => Toast.show({ type: 'info', text1: 'Admin Hub', text2: 'Edit mode will be available in the next sync.', position: 'bottom' })}
            >
              <MaterialIcons name="edit" size={20} color={Colors.white} />
              <Text style={styles.editBtnText}>Edit Machine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Professional Delete Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <MaterialIcons name="report-problem" size={40} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalDesc}>
              Are you sure you want to remove this machine? This action cannot be undone on the website.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>DELETE</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageHeader: { height: 350, backgroundColor: Colors.background, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, left: 24, width: 44, height: 44, borderRadius: 15, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, elevation: 5 },
  shareBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 40, right: 24, width: 44, height: 44, borderRadius: 15, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, elevation: 5 },
  content: { padding: 24, marginTop: -30, backgroundColor: Colors.white, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  category: { fontSize: 13, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '900', color: Colors.text, marginTop: 4 },
  sku: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  priceTag: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 15, marginLeft: 10 },
  priceValue: { color: Colors.white, fontWeight: '900', fontSize: 18 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 24, opacity: 0.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 12, fontWeight: '900' },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  editBtn: { flex: 1, height: 56, backgroundColor: Colors.primary, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  editBtnText: { color: Colors.white, fontWeight: '800', marginLeft: 8 },
  deleteBtn: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, borderColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 24,
    alignItems: 'center',
  },
  modalIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.white,
  },
});

export default ProductDetailScreen;
