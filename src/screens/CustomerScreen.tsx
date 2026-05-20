import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import api from '../utils/api';

const CustomerScreen = () => {
  const { data: customers, isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await api.get('customers', { params: { per_page: 50 } });
      return response.data;
    },
  });

  const renderItem = ({ item, index }: any) => {
    const fullName = `${item.first_name} ${item.last_name}`.trim() || 'Guest User';
    const email = item.email || 'No email provided';

    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 50).springify().damping(12)}
        layout={LinearTransition.springify()}
      >
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{fullName.charAt(0)}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.nameText}>{fullName}</Text>
            <Text style={styles.emailText}>{email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.miniStat}>
                <MaterialIcons name="shopping-bag" size={12} color={Colors.textSecondary} />
                <Text style={styles.miniStatText}>{item.orders_count} Orders</Text>
              </View>
              <View style={styles.dot} />
              <View style={styles.miniStat}>
                <MaterialIcons name="payments" size={12} color={Colors.success} />
                <Text style={styles.miniStatText}>৳{parseFloat(item.total_spent || 0).toLocaleString()}</Text>
              </View>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={Colors.border} />
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
          <Text style={styles.headerSubtitle}>User Database</Text>
          <Text style={styles.headerTitle}>Customers</Text>
        </View>
        <View style={styles.searchBtn}>
          <MaterialIcons name="search" size={24} color={Colors.primary} />
        </View>
      </View>

      <FlatList
        data={customers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
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
  searchBtn: {
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
    borderRadius: 28,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.primary,
  },
  infoBox: {
    flex: 1,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.text,
  },
  emailText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
    marginLeft: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  callBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomerScreen;
