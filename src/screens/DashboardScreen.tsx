import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Linking, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import api from '../utils/api';
// @ts-ignore
import { SITE_URL } from '@env';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }: any) => {
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['sales-report'],
    queryFn: async () => {
      try {
        const response = await api.get('reports/sales', { params: { period: 'last_7days' } });
        return Array.isArray(response.data) ? response.data[0] : null;
      } catch (e) {
        console.error('Report fetch error:', e);
        return null;
      }
    },
  });

  const { data: productsCount } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      try {
        const response = await api.get('products', { params: { per_page: 1 } });
        return response.headers['x-wp-total'] || '0';
      } catch (e) {
        return '0';
      }
    },
  });

  const { data: ordersCount } = useQuery({
    queryKey: ['orders-count'],
    queryFn: async () => {
      try {
        const response = await api.get('orders', { params: { per_page: 1 } });
        return response.headers['x-wp-total'] || '0';
      } catch (e) {
        return '0';
      }
    },
  });

  const { data: customersCount } = useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      try {
        const response = await api.get('customers', { params: { per_page: 1 } });
        return response.headers['x-wp-total'] || '0';
      } catch (e) {
        return '0';
      }
    },
  });

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive', 
        onPress: async () => {
          await AsyncStorage.removeItem('isLoggedIn');
          navigation.replace('Login');
        } 
      },
    ]);
  };

  const openWebsite = () => {
    Linking.openURL(SITE_URL);
  };

  const revenueValue = useMemo(() => {
    const val = parseFloat(reportData?.total_sales || '0');
    return isNaN(val) ? '৳0' : `৳${val.toLocaleString()}`;
  }, [reportData]);

  const stats = [
    { title: 'Total Revenue', value: revenueValue, icon: 'payments', color: Colors.success, trend: 'Last 7 days' },
    { title: 'New Orders', value: ordersCount || '0', icon: 'shopping-basket', color: Colors.info, trend: 'Total' },
    { title: 'Active Items', value: productsCount || '0', icon: 'precision-manufacturing', color: Colors.warning, trend: 'Inventory' },
    { title: 'Total Clients', value: customersCount || '0', icon: 'badge', color: Colors.primary, trend: 'Database' },
  ];

  const actions = [
    { title: 'Add Machine', icon: 'add-circle-outline', screen: 'AddProduct', desc: 'Create listing' },
    { title: 'Categories', icon: 'account-tree', screen: 'AddCategory', desc: 'Manage types' },
    { title: 'Site Info', icon: 'public', screen: 'SiteSettings', desc: 'Global settings' },
    { title: 'Scan SKU', icon: 'qr-code-scanner', screen: 'Scanner', desc: 'Quick search' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Modern Header */}
        <LinearGradient colors={Colors.gradient} style={styles.header}>
          <View style={styles.headerTop}>
            <Animated.View entering={FadeIn.duration(800)}>
              <Text style={styles.greetingText}>System Online</Text>
              <Text style={styles.headerTitle}>Overview</Text>
            </Animated.View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.profileBtn} onPress={openWebsite}>
                <MaterialIcons name="public" size={24} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.profileBtn, { marginLeft: 12 }]} onPress={handleLogout}>
                <MaterialIcons name="power-settings-new" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Weekly Total Sales</Text>
              <Text style={styles.heroValue}>{revenueValue}</Text>
              <View style={styles.heroBadge}>
                <MaterialIcons name="trending-up" size={16} color={Colors.success} />
                <Text style={styles.heroBadgeText}>LIVE UPDATING</Text>
              </View>
            </View>
            <View style={styles.heroGraphic}>
              <MaterialIcons name="bar-chart" size={80} color="rgba(255,255,255,0.1)" />
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInUp.delay(300 + index * 100).springify().damping(12)} 
                style={styles.statCard}
              >
                <View style={[styles.statIconBox, { backgroundColor: stat.color + '15' }]}>
                  <MaterialIcons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={styles.trendRow}>
                  <MaterialIcons name="trending-up" size={12} color={stat.color} />
                  <Text style={[styles.statTrend, { color: stat.color }]}>{stat.trend}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Professional Action Cards */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Management Hub</Text>
          </View>

          <View style={styles.actionsList}>
            {actions.map((action, index) => (
              <Animated.View 
                key={index} 
                entering={FadeInRight.delay(600 + index * 100)}
              >
                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  <View style={styles.actionMain}>
                    <View style={styles.actionIconWrapper}>
                      <MaterialIcons name={action.icon as any} size={26} color={Colors.primary} />
                    </View>
                    <View style={styles.actionTextContent}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionDesc}>{action.desc}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color={Colors.border} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 80,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 30,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  heroValue: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    marginVertical: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  heroBadgeText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  heroGraphic: {
    marginLeft: 10,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -50,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.surface,
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 32,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(7, 51, 52, 0.03)',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
  },
  statTitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statTrend: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  actionMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionTextContent: {
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
});

export default DashboardScreen;
