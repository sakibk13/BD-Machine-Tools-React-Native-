import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import api from '../utils/api';

const CustomerScreen = () => {
  const [search, setSearch] = useState('');

  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('customers', { params: { per_page: 100, role: 'all' } });
      return response.data;
    },
  });

  const filteredCustomers = customers?.filter((c: any) => 
    c.first_name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item: customer }: any) => (
    <View style={styles.customerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{customer.first_name[0] || 'C'}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{customer.first_name} {customer.last_name}</Text>
        <Text style={styles.email}>{customer.email}</Text>
        <View style={styles.orderCountBadge}>
          <MaterialIcons name="shopping-bag" size={12} color={Colors.accent} />
          <Text style={styles.orderCountText}>{customer.orders_count} Orders</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.actionBtn}>
        <MaterialIcons name="chevron-right" size={24} color={Colors.border} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Client Database</Text>
        <Text style={styles.headerTitle}>Customers</Text>
        
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialIcons name="people-outline" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>No customers found.</Text>
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
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: 16, paddingHorizontal: 15, height: 50, marginTop: 20 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: Colors.text, fontWeight: '600' },
  list: { padding: 20, paddingBottom: 100 },
  customerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 24, padding: 16, marginBottom: 12, elevation: 2 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: '900' },
  info: { flex: 1, marginLeft: 15 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  orderCountBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: Colors.accent + '10', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderCountText: { fontSize: 10, fontWeight: '800', color: Colors.accent, marginLeft: 4 },
  actionBtn: { padding: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
});

export default CustomerScreen;
