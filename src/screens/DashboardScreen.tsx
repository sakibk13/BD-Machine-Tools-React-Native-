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
import { EXPO_PUBLIC_SITE_URL } from '@env';

const SITE_URL = EXPO_PUBLIC_SITE_URL || process.env.EXPO_PUBLIC_SITE_URL || 'https://bdmachinetools.com';

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
    { title: 'Total Clients', value: customersCount || '0', icon: 'badge', color: Colors.accent, trend: 'Database' },
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
              <Text style={styles.greetingText}>Terminal Active</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </Animated.View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.profileBtn} onPress={openWebsite}>
                <MaterialIcons name="language" size={22} color={Colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.profileBtn, { marginLeft: 12 }]} onPress={handleLogout}>
                <MaterialIcons name="logout" size={22} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View entering={FadeInUp.delay(300).duration(800)} style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Weekly Performance</Text>
              <Text style={styles.heroValue}>{revenueValue}</Text>
              <View style={styles.heroBadge}>
                <View style={styles.livePulse} />
                <Text style={styles.heroBadgeText}>LIVE METRICS</Text>
              </View>
            </View>
            <View style={styles.heroGraphic}>
              <MaterialIcons name="insights" size={70} color="rgba(255,255,255,0.15)" />
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
                <View style={[styles.statIconBox, { backgroundColor: stat.color + '10' }]}>
                  <MaterialIcons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
                <View style={styles.trendRow}>
                  <Text style={[styles.statTrend, { color: stat.color }]}>{stat.trend}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Professional Action Cards */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Operations Center</Text>
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
                      <MaterialIcons name={action.icon as any} size={24} color={Colors.accent} />
                    </View>
                    <View style={styles.actionTextContent}>
                      <Text style={styles.actionTitle}>{action.title}</Text>
                      <Text style={styles.actionDesc}>{action.desc}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={16} color={Colors.border} />
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
    paddingBottom: 70,
    borderBottomLeftRadius: 45,
    borderBottomRightRadius: 45,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 32,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroContent: {
    flex: 1,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroValue: {
    color: Colors.white,
    fontSize: 30,
    fontWeight: '900',
    marginVertical: 6,
    letterSpacing: -0.5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 4,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginRight: 8,
  },
  heroBadgeText: {
    color: Colors.accentLight,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroGraphic: {
    marginLeft: 10,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: Colors.surface,
    width: (width - 55) / 2,
    padding: 20,
    borderRadius: 32,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '700',
    marginTop: 2,
  },
  statTrend: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 16,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
  },
  actionMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 18,
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
    fontWeight: '900',
    color: Colors.text,
  },
  actionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
});

export default DashboardScreen;
