import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform, Share, ActivityIndicator, Modal } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import api from '../utils/api';
// @ts-ignore
import { EXPO_PUBLIC_SITE_URL } from '@env';

const SITE_URL = EXPO_PUBLIC_SITE_URL || process.env.EXPO_PUBLIC_SITE_URL || 'https://bdmachinetools.com';

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
      const message = `BD Machine Tools Asset:\nModel: ${product.name}\nSKU: ${product.sku || 'N/A'}\nPrice: ৳${parseFloat(product.price).toLocaleString()}\nSource: ${SITE_URL}/?p=${product.id}`;
      await Share.share({
        message,
        url: `${SITE_URL}/?p=${product.id}`,
        title: product.name,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Link Broadcast Failed',
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
        text1: 'Asset Terminated',
        text2: 'Machine has been removed from cloud storage.',
        position: 'bottom'
      });
      navigation.goBack();
    },
    onError: () => {
      setDeleteModalVisible(false);
      Toast.show({
        type: 'error',
        text1: 'Action Denied',
        text2: 'Server rejected the deletion request.',
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
        <ActivityIndicator size="large" color={Colors.accent} />
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
            <MaterialIcons name="arrow-back-ios" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <MaterialIcons name="ios-share" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.categoryBadge}>
                <Text style={styles.category}>{product.categories[0]?.name || 'Industrial'}</Text>
              </View>
              <Text style={styles.title}>{product.name}</Text>
              <View style={styles.skuRow}>
                <MaterialIcons name="tag" size={14} color={Colors.textMuted} />
                <Text style={styles.sku}>Serial: {product.sku || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.priceTag}>
              <Text style={styles.currency}>৳</Text>
              <Text style={styles.priceValue}>{parseFloat(product.price).toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Asset Availability</Text>
            <View style={[styles.statusBadge, { backgroundColor: product.stock_status === 'instock' ? Colors.success + '10' : Colors.error + '10' }]}>
              <View style={[styles.statusDot, { backgroundColor: product.stock_status === 'instock' ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusText, { color: product.stock_status === 'instock' ? Colors.success : Colors.error }]}>
                {product.stock_status === 'instock' ? 'AVAILABLE IN WAREHOUSE' : 'CURRENTLY UNAVAILABLE'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Data</Text>
            <Text style={styles.description}>
              {product.description?.replace(/<[^>]*>?/gm, '') || 'Specifications are currently being updated.'}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => Toast.show({ type: 'info', text1: 'Admin Hub', text2: 'Edit mode will be available in the next sync.', position: 'bottom' })}
            >
              <MaterialIcons name="tune" size={20} color={Colors.white} />
              <Text style={styles.editBtnText}>Modify Specs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <MaterialIcons name="delete-sweep" size={22} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 60 }} />
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
              <MaterialIcons name="warning-amber" size={44} color={Colors.error} />
            </View>
            <Text style={styles.modalTitle}>Delete Confirmation</Text>
            <Text style={styles.modalDesc}>
              Are you sure you want to delete this machine entry from the database?
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
  imageHeader: { height: 380, backgroundColor: Colors.background, position: 'relative' },
  headerImage: { width: '100%', height: '100%' },
  placeholderImg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 45, left: 24, width: 46, height: 46, borderRadius: 16, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  shareBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 45, right: 24, width: 46, height: 46, borderRadius: 16, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  content: { padding: 26, marginTop: -40, backgroundColor: Colors.white, borderTopLeftRadius: 45, borderTopRightRadius: 45, elevation: 5 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  categoryBadge: { backgroundColor: Colors.accent + '10', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  category: { fontSize: 10, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.text, letterSpacing: -0.5 },
  skuRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  sku: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  priceTag: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 20, marginLeft: 10, alignItems: 'center' },
  currency: { color: Colors.accentLight, fontSize: 12, fontWeight: '900' },
  priceValue: { color: Colors.white, fontWeight: '900', fontSize: 20, marginTop: -2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 28, opacity: 0.6 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 15, fontWeight: '900', color: Colors.text, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  statusText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  description: { fontSize: 15, color: Colors.textSecondary, lineHeight: 24, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 14, marginTop: 10 },
  editBtn: { flex: 1, height: 64, backgroundColor: Colors.primary, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 8 },
  editBtnText: { color: Colors.white, fontWeight: '900', marginLeft: 10, fontSize: 15, letterSpacing: 0.5 },
  deleteBtn: { width: 64, height: 64, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.error, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { width: '100%', backgroundColor: Colors.white, borderRadius: 40, padding: 30, alignItems: 'center' },
  modalIconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.error + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: Colors.text, marginBottom: 12, textAlign: 'center' },
  modalDesc: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 40, paddingHorizontal: 10 },
  modalActions: { flexDirection: 'row', gap: 14 },
  cancelBtn: { flex: 1, height: 60, borderRadius: 20, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '900', color: Colors.textSecondary, letterSpacing: 1 },
  confirmBtn: { flex: 1, height: 60, borderRadius: 20, backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  confirmBtnText: { fontSize: 14, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
});

export default ProductDetailScreen;
