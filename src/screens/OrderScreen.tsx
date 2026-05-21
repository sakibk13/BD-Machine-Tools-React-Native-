import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import api from '../utils/api';

const OrderScreen = () => {
  const [filter, setStatus] = useState<string | null>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', filter],
    queryFn: async () => {
      const params: any = { per_page: 50 };
      if (filter) params.status = filter;
      const response = await api.get('orders', { params });
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return Colors.success;
      case 'processing': return Colors.info;
      case 'pending': return Colors.warning;
      case 'cancelled': return Colors.error;
      default: return Colors.textSecondary;
    }
  };

  const renderItem = ({ item: order }: any) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>ORDER #{order.id}</Text>
          <Text style={styles.orderDate}>{new Date(order.date_created).toLocaleDateString()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.customerInfo}>
        <MaterialIcons name="person-outline" size={18} color={Colors.textSecondary} />
        <Text style={styles.customerName}>{order.billing.first_name} {order.billing.last_name}</Text>
      </View>

      <View style={styles.itemsList}>
        {order.line_items.map((item: any) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total Revenue</Text>
        <Text style={styles.totalAmount}>৳{parseFloat(order.total).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Sales Pipeline</Text>
        <Text style={styles.headerTitle}>Orders</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {['all', 'processing', 'completed', 'pending', 'cancelled'].map((status) => (
            <TouchableOpacity 
              key={status}
              style={[styles.filterChip, (filter === status || (status === 'all' && filter === null)) && styles.filterChipActive]}
              onPress={() => setStatus(status === 'all' ? null : status)}
            >
              <Text style={[styles.filterText, (filter === status || (status === 'all' && filter === null)) && styles.filterTextActive]}>
                {status.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="shopping-bag" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>No orders found in this category.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 24, paddingTop: 60, backgroundColor: Colors.white, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, elevation: 5 },
  headerSubtitle: { fontSize: 11, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 2 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: Colors.text, letterSpacing: -1 },
  filterScroll: { marginTop: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: Colors.background, marginRight: 8, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  filterText: { fontSize: 11, fontWeight: '800', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  list: { padding: 20, paddingBottom: 100 },
  orderCard: { backgroundColor: Colors.surface, borderRadius: 28, padding: 20, marginBottom: 16, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNumber: { fontSize: 16, fontWeight: '900', color: Colors.text },
  orderDate: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 15, opacity: 0.5 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  customerName: { marginLeft: 8, fontSize: 14, fontWeight: '700', color: Colors.text },
  itemsList: { gap: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { flex: 1, fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  itemQty: { marginLeft: 10, fontSize: 13, fontWeight: '700', color: Colors.text },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  totalAmount: { fontSize: 18, fontWeight: '900', color: Colors.primary },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
});

import { ScrollView } from 'react-native';
export default OrderScreen;
