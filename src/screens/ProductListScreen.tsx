import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Platform, Image, TextInput, Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography } from '../theme/typography';
import api from '../utils/api';

const { width } = Dimensions.get('window');
// Calculate card width more robustly
const CONTAINER_PADDING = 15;
const GAP = 15;
const CARD_WIDTH = (width - (CONTAINER_PADDING * 2) - GAP) / 2;

const ProductListScreen = ({ navigation }: any) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await api.get('products/categories', { params: { per_page: 100 } });
        return Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Failed to fetch categories:', e);
        return [];
      }
    },
  });

  const { data: products, isLoading, refetch, isError } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: async () => {
      try {
        const params: any = { per_page: 50 };
        if (selectedCategory) params.category = selectedCategory;
        const response = await api.get('products', { params });
        return Array.isArray(response.data) ? response.data : [];
      } catch (e) {
        console.error('Failed to fetch products:', e);
        return [];
      }
    },
  });

  // Memoize filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => {
      const nameMatch = p?.name?.toLowerCase().includes(search.toLowerCase());
      const skuMatch = p?.sku?.toLowerCase().includes(search.toLowerCase());
      return nameMatch || skuMatch;
    });
  }, [products, search]);

  const renderItem = ({ item }: { item: any }) => {
    if (!item || !item.id) return null;

    const name = item.name || 'Unknown Product';
    const price = item.price ? `৳${parseFloat(item.price).toLocaleString()}` : 'Price N/A';
    const oldPrice = item.regular_price && item.on_sale ? `৳${parseFloat(item.regular_price).toLocaleString()}` : null;
    const outOfStock = item.stock_status === 'outofstock';
    const imageUrl = (item.images && item.images.length > 0) ? item.images[0].src : null;
    const categoryName = (item.categories && item.categories.length > 0) ? item.categories[0].name : 'Uncategorized';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImg}>
              <MaterialIcons name="settings-input-component" size={40} color={Colors.border} />
            </View>
          )}
          {item.on_sale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>OFFER</Text>
            </View>
          )}
          {outOfStock && (
            <View style={styles.stockOverlay}>
              <Text style={styles.stockText}>OUT OF STOCK</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.categoryText} numberOfLines={1}>{categoryName}</Text>
          <Text style={styles.productName} numberOfLines={2}>{name}</Text>
          
          <View style={styles.cardFooter}>
            <View style={{ flex: 1 }}>
              <Text style={styles.priceText} numberOfLines={1}>{price}</Text>
              {oldPrice && (
                <Text style={styles.oldPrice} numberOfLines={1}>{oldPrice}</Text>
              )}
            </View>
            <View style={[styles.stockDot, { backgroundColor: outOfStock ? Colors.error : Colors.success }]} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isError) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={50} color={Colors.error} />
        <Text style={styles.emptyText}>Failed to load products. Check your connection.</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerSubtitle}>Fleet Management</Text>
            <Text style={styles.headerTitle}>Machines</Text>
          </View>
          <TouchableOpacity 
            style={styles.addBtn} 
            onPress={() => navigation.navigate('AddProduct')}
          >
            <MaterialIcons name="add" size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by SKU or Model..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={Colors.textMuted}
              autoCorrect={false}
            />
          </View>
          <TouchableOpacity 
            style={styles.scanBtn}
            onPress={() => navigation.navigate('Scanner', { onScan: (data: string) => setSearch(data) })}
          >
            <MaterialIcons name="qr-code-scanner" size={22} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        <View style={styles.categoryListContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: null, name: 'All Assets' }, ...(categories || [])]}
            renderItem={({ item: cat }: any) => (
              <TouchableOpacity 
                style={[styles.catChip, (selectedCategory === cat.id || (cat.id === null && selectedCategory === null)) && styles.catChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.catText, (selectedCategory === cat.id || (cat.id === null && selectedCategory === null)) && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(cat, idx) => (cat.id !== null ? cat.id.toString() : `all-${idx}`)}
            contentContainerStyle={styles.categoryScroll}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="inventory" size={60} color={Colors.border} />
              <Text style={styles.emptyText}>No machines matching your query.</Text>
            </View>
          }
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={true}
        />
      )}
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
    padding: 40,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CONTAINER_PADDING + 10,
    marginBottom: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: -1,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: CONTAINER_PADDING + 10,
    marginBottom: 16,
    gap: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  scanBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryListContainer: {
    marginBottom: 24,
  },
  categoryScroll: {
    paddingHorizontal: CONTAINER_PADDING + 10,
  },
  catChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.card,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  catText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  catTextActive: {
    color: Colors.white,
  },
  list: {
    padding: CONTAINER_PADDING,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    marginBottom: GAP,
    width: CARD_WIDTH,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH - 20,
    borderRadius: (CARD_WIDTH - 20) / 2, // Perfect circle
    overflow: 'hidden',
    backgroundColor: Colors.card,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  saleText: {
    color: Colors.white,
    fontSize: 8,
    fontWeight: '900',
  },
  stockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockText: {
    color: Colors.error,
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
  },
  cardInfo: {
    marginTop: 12,
    paddingHorizontal: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
    height: 38,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primary,
  },
  oldPrice: {
    fontSize: 10,
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 20,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    backgroundColor: Colors.primary,
    borderRadius: 16,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1,
  },
});

export default ProductListScreen;
