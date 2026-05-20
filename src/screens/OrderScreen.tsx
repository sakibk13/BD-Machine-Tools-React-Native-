import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInLeft, LinearTransition } from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import api from '../utils/api';

const OrderScreen = () => {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('orders', { params: { per_page: 50 } });
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number, status: string }) => {
      const response = await api.put(`orders/${orderId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Success', 'Order status updated successfully!');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update order status.');
    }
  });

  const handleUpdateStatus = (orderId: number) => {
    Alert.alert(
      'Update Status',
      'Select new status for this order:',
      [
        { text: 'Completed', onPress: () => updateStatusMutation.mutate({ orderId, status: 'completed' }) },
        { text: 'Processing', onPress: () => updateStatusMutation.mutate({ orderId, status: 'processing' }) },
        { text: 'Cancelled', onPress: () => updateStatusMutation.mutate({ orderId, status: 'cancelled' }), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return { color: Colors.success, icon: 'check-circle' };
      case 'processing': return { color: Colors.info, icon: 'sync' };
      case 'pending': return { color: Colors.warning, icon: 'schedule' };
      case 'cancelled': return { color: Colors.error, icon: 'cancel' };
      default: return { color: Colors.textSecondary, icon: 'help' };
    }
  };

  const renderItem = ({ item, index }: any) => {
    const isExpanded = expandedId === item.id;
    const config = getStatusConfig(item.status);
    const customerName = `${item.billing?.first_name} ${item.billing?.last_name}`.trim() || 'Guest Customer';
    const date = new Date(item.date_created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <Animated.View 
        entering={FadeInLeft.delay(index * 50).duration(600)}
        layout={LinearTransition.springify()}
      >
        <TouchableOpacity 
          style={[styles.card, isExpanded && styles.cardExpanded]} 
          activeOpacity={0.9}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.orderIdBox}>
              <Text style={styles.idLabel}>Order ID</Text>
              <Text style={styles.idValue}>#{item.id}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: config.color + '10' }]}>
              <MaterialIcons name={config.icon} size={14} color={config.color} style={{ marginRight: 6 }} />
              <Text style={[styles.statusText, { color: config.color }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardBody}>
            <View style={styles.customerBox}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{customerName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.customerName}>{customerName}</Text>
                <Text style={styles.orderMeta}>{item.line_items.length} items • {date}</Text>
              </View>
            </View>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>৳{parseFloat(item.total).toLocaleString()}</Text>
            </View>
          </View>
          
          {isExpanded && (
            <Animated.View entering={FadeInLeft.duration(400)} style={styles.expandedContent}>
              <Text style={styles.itemsTitle}>Order Items</Text>
              {item.line_items.map((line: any, idx: number) => (
                <View key={idx} style={styles.lineItem}>
                  <View style={styles.lineLeft}>
                    <Text style={styles.lineName} numberOfLines={1}>{line.name}</Text>
                    <Text style={styles.lineQty}>Qty: {line.quantity}</Text>
                  </View>
                  <Text style={styles.lineTotal}>৳{parseFloat(line.total).toLocaleString()}</Text>
                </View>
              ))}
              
              <View style={styles.addressBox}>
                <Text style={styles.addressTitle}>Shipping Address</Text>
                <Text style={styles.addressText}>
                  {item.shipping.address_1}, {item.shipping.city}, {item.shipping.state}
                </Text>
              </View>
            </Animated.View>
          )}

          <View style={styles.cardFooter}>
            <TouchableOpacity 
              style={styles.footerAction}
              onPress={() => handleUpdateStatus(item.id)}
            >
              <MaterialIcons name="edit" size={18} color={Colors.primary} />
              <Text style={styles.actionText}>Update Status</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.footerAction}
              onPress={() => setExpandedId(isExpanded ? null : item.id)}
            >
              <MaterialIcons name={isExpanded ? "expand-less" : "expand-more"} size={18} color={Colors.primary} />
              <Text style={styles.actionText}>{isExpanded ? "Collapse" : "Details"}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Sales Activity</Text>
          <Text style={styles.headerTitle}>Orders</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="tune" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
  },
  filterBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(7, 51, 52, 0.02)',
  },
  cardExpanded: {
    borderColor: Colors.primary + '20',
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderIdBox: {
    flexDirection: 'column',
  },
  idLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  idValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
    marginVertical: 16,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  orderMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.primary,
  },
  expandedContent: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    opacity: 0.8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  lineLeft: {
    flex: 1,
    marginRight: 10,
  },
  lineName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  lineQty: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  lineTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text,
  },
  addressBox: {
    marginTop: 16,
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderStyle: 'dashed',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: 6,
  },
});

export default OrderScreen;
