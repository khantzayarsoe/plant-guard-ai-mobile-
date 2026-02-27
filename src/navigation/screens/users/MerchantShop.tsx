import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BASE_URL } from "../../../types/api";
import { getToken, getUserData } from "../../services/authService";

const { width } = Dimensions.get("window");

// Types based on API response
interface ProductPhoto {
  url: string;
}

interface Product {
  pesticideId: number;
  name: string;
  price: number;
  photo: ProductPhoto;
}

interface Shop {
  shopId: number;
  name: string | null;
  Items: Product[];
}

interface ApiResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    shops: Shop[];
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
}

// Create a unique identifier combining shopId and pesticideId
interface ProductWithShop extends Product {
  shopName: string;
  shopId: number;
  uniqueId: string;
}

interface CartItem extends ProductWithShop {
  quantity: number;
}

// Order types
interface OrderItem {
  pesticideId: number;
  quantity: number;
}

interface ShopOrder {
  shopId: number;
  Items: OrderItem[];
}

interface OrderRequest {
  address: string;
  orders: ShopOrder[];
}

// Default images for products without photos
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400";

// Helper function to construct image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return DEFAULT_IMAGE;
  const cleanPath = imagePath.startsWith("/")
    ? imagePath.substring(1)
    : imagePath;
  return `${BASE_URL}/uploads/${cleanPath}`;
};

// Product Card Component with Quantity Controls
const ProductCard: React.FC<{
  product: ProductWithShop;
  cartItems: CartItem[];
  addToCart: (product: ProductWithShop) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
}> = ({ product, cartItems, addToCart, removeFromCart, updateQuantity }) => {
  const cartItem = cartItems.find((item) => item.uniqueId === product.uniqueId);
  const quantity = cartItem?.quantity || 0;

  const imageUrl = product.photo?.url
    ? getImageUrl(product.photo.url)
    : DEFAULT_IMAGE;

  return (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
          defaultSource={{ uri: DEFAULT_IMAGE }}
        />
        {quantity > 0 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityBadgeText}>{quantity}</Text>
          </View>
        )}
      </View>

      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name || "Unnamed Product"}
        </Text>

        <View style={styles.shopInfoContainer}>
          <Text style={styles.shopLabel}>Sold by:</Text>
          <TouchableOpacity>
            <Text style={styles.shopName}>
              {product.shopName?.trim() || "Unknown Shop"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            ${product.price?.toFixed(2) || "0.00"}
          </Text>
        </View>

        <View style={styles.actionContainer}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => addToCart(product)}
            >
              <Feather name="shopping-cart" size={16} color="#FFF" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => {
                  if (quantity === 1) {
                    removeFromCart(product.uniqueId);
                  } else {
                    updateQuantity(product.uniqueId, quantity - 1);
                  }
                }}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(product.uniqueId, quantity + 1)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Cart Modal Component with Checkout API
const CartModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  updateQuantity: (uniqueId: string, quantity: number) => void;
  removeFromCart: (uniqueId: string) => void;
  clearCart: () => void;
}> = ({
  visible,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
}) => {
  const [address, setAddress] = useState("");
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0,
  );
  const tabBarHeight = useBottomTabBarHeight();

  // Get farmer ID on mount
  useEffect(() => {
    const fetchFarmerId = async () => {
      const userData = await getUserData();
      if (userData?.userId) {
        setFarmerId(userData.userId);
      }
    };
    fetchFarmerId();
  }, []);

  // Group cart items by shop
  const groupItemsByShop = (): ShopOrder[] => {
    const shopMap = new Map<number, OrderItem[]>();

    cartItems.forEach((item) => {
      if (!shopMap.has(item.shopId)) {
        shopMap.set(item.shopId, []);
      }
      shopMap.get(item.shopId)?.push({
        pesticideId: item.pesticideId,
        quantity: item.quantity,
      });
    });

    const orders: ShopOrder[] = [];
    shopMap.forEach((Items, shopId) => {
      orders.push({ shopId, Items });
    });

    return orders;
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      setShowAddressInput(true);
      return;
    }

    if (!farmerId) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const orders = groupItemsByShop();

      const requestBody: OrderRequest = {
        address: address.trim(),
        orders: orders,
      };

      console.log("Submitting order:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${BASE_URL}/api/farmer/${farmerId}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const responseData = await response.json();
      console.log("Order response:", responseData);

      if (response.ok || responseData.statusCode === 200) {
        Alert.alert(
          "Success",
          `Order placed successfully!\nTotal: $${totalPrice.toFixed(2)}`,
        );
        clearCart();
        setAddress("");
        setShowAddressInput(false);
        onClose();
      } else {
        throw new Error(responseData.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckoutPress = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items to your cart first");
      return;
    }

    if (!showAddressInput) {
      setShowAddressInput(true);
    } else {
      handleCheckout();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { marginBottom: tabBarHeight }]}>
          <LinearGradient
            colors={["#1B5E20", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>Shopping Cart</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {cartItems.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <Feather name="shopping-cart" size={60} color="#E0E0E0" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubText}>
                Add items to get started
              </Text>
              <TouchableOpacity style={styles.continueButton} onPress={onClose}>
                <Text style={styles.continueButtonText}>Continue Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView
                style={styles.cartItemsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.cartItemsContent}
              >
                {/* Address Input */}
                {showAddressInput && (
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Delivery Address *</Text>
                    <TextInput
                      style={styles.addressInput}
                      placeholder="Enter your delivery address"
                      placeholderTextColor="#999"
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                )}

                {/* Cart Items */}
                {cartItems.map((item) => {
                  const imageUrl = item.photo?.url
                    ? getImageUrl(item.photo.url)
                    : DEFAULT_IMAGE;

                  return (
                    <View key={item.uniqueId} style={styles.cartItem}>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.cartItemImage}
                        defaultSource={{ uri: DEFAULT_IMAGE }}
                      />

                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName} numberOfLines={2}>
                          {item.name || "Unnamed Product"}
                        </Text>
                        <Text style={styles.cartItemPrice}>
                          ${item.price?.toFixed(2) || "0.00"} each
                        </Text>
                        <Text style={styles.cartItemShop}>
                          {item.shopName?.trim() || "Unknown Shop"}
                        </Text>

                        <View style={styles.cartItemControls}>
                          <View style={styles.cartQuantityControls}>
                            <TouchableOpacity
                              style={styles.cartQuantityButton}
                              onPress={() => {
                                if (item.quantity === 1) {
                                  removeFromCart(item.uniqueId);
                                } else {
                                  updateQuantity(
                                    item.uniqueId,
                                    item.quantity - 1,
                                  );
                                }
                              }}
                            >
                              <Text style={styles.cartQuantityButtonText}>
                                −
                              </Text>
                            </TouchableOpacity>

                            <Text style={styles.cartQuantityText}>
                              {item.quantity}
                            </Text>

                            <TouchableOpacity
                              style={styles.cartQuantityButton}
                              onPress={() =>
                                updateQuantity(item.uniqueId, item.quantity + 1)
                              }
                            >
                              <Text style={styles.cartQuantityButtonText}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            onPress={() => removeFromCart(item.uniqueId)}
                          >
                            <Feather name="trash-2" size={18} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
                <View style={{ height: 20 }} />
              </ScrollView>

              <View style={styles.cartFooter}>
                {/* Order Summary */}
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Items:</Text>
                  <Text style={styles.totalValue}>{totalItems}</Text>
                </View>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalLabel}>Total Price:</Text>
                  <Text style={styles.totalPrice}>
                    ${totalPrice.toFixed(2)}
                  </Text>
                </View>

                {/* Grouped by shop preview */}
                {cartItems.length > 0 && (
                  <View style={styles.shopGroupPreview}>
                    <Text style={styles.shopGroupTitle}>
                      Order Summary by Shop:
                    </Text>
                    {Array.from(
                      new Set(cartItems.map((item) => item.shopId)),
                    ).map((shopId) => {
                      const shopItems = cartItems.filter(
                        (item) => item.shopId === shopId,
                      );
                      const shopTotal = shopItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0,
                      );
                      const shopName =
                        shopItems[0]?.shopName || `Shop ${shopId}`;

                      return (
                        <View key={shopId} style={styles.shopGroupItem}>
                          <Text style={styles.shopGroupName}>{shopName}</Text>
                          <Text style={styles.shopGroupItems}>
                            {shopItems.length} items • ${shopTotal.toFixed(2)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.cartActions}>
                  <TouchableOpacity
                    style={styles.clearCartButton}
                    onPress={() => {
                      Alert.alert(
                        "Clear Cart",
                        "Are you sure you want to clear your cart?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Clear", onPress: clearCart },
                        ],
                      );
                    }}
                  >
                    <Text style={styles.clearCartText}>Clear Cart</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.checkoutButton,
                      (submitting || (showAddressInput && !address.trim())) &&
                        styles.disabledButton,
                    ]}
                    onPress={handleCheckoutPress}
                    disabled={
                      submitting || (showAddressInput && !address.trim())
                    }
                  >
                    <LinearGradient
                      colors={["#2E7D32", "#1B5E20"]}
                      style={styles.checkoutGradient}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.checkoutText}>
                          {showAddressInput
                            ? "Confirm Order"
                            : "Proceed to Checkout"}
                        </Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Main Component
const MerchantShop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartVisible, setCartVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<Shop[]>([]);
  const [allProducts, setAllProducts] = useState<ProductWithShop[]>([]);
  const [searchText, setSearchText] = useState("");
  const tabBarHeight = useBottomTabBarHeight();

  // Fetch shops data from API
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await fetch(`${BASE_URL}/api/shops`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData: ApiResponse = await response.json();
      console.log("Shops API response:", responseData);

      if (responseData.statusCode === 200 && responseData.data?.shops) {
        setShops(responseData.data.shops);

        // Flatten products with shop information and create unique IDs
        const products: ProductWithShop[] = [];
        responseData.data.shops.forEach((shop) => {
          if (shop.Items && shop.Items.length > 0 && shop.name) {
            shop.Items.forEach((item) => {
              const uniqueId = `${shop.shopId}-${item.pesticideId}`;
              products.push({
                ...item,
                pesticideId: item.pesticideId,
                shopName: shop.name?.trim() || "Unknown Shop",
                shopId: shop.shopId,
                uniqueId,
              });
            });
          }
        });
        console.log("Processed products:", products.length);
        setAllProducts(products);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Cart functions
  const addToCart = (product: ProductWithShop) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.uniqueId === product.uniqueId,
      );

      if (existingItem) {
        return prevItems.map((item) =>
          item.uniqueId === product.uniqueId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.uniqueId !== uniqueId),
    );
  };

  const updateQuantity = (uniqueId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(uniqueId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.uniqueId === uniqueId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  // Filter products based on search
  const filteredProducts = allProducts.filter((product) =>
    product.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const categories = [
    "All",
    "Organic",
    "Fungicides",
    "Herbicides",
    "Insecticides",
  ];

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <View style={styles.container}>
          {/* Header with Cart Icon */}
          <LinearGradient
            colors={["#1B5E20", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <BlurView intensity={80} tint="light" style={styles.searchBlur}>
                  <Feather name="search" size={20} color="#70AB6D" />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText("")}>
                      <Feather name="x" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </BlurView>
              </View>
              <TouchableOpacity
                style={styles.cartIconButton}
                onPress={() => setCartVisible(true)}
              >
                <Feather name="shopping-cart" size={24} color="#FFFFFF" />
                {totalCartItems > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {totalCartItems > 9 ? "9+" : totalCartItems}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesContainer}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.toLowerCase() &&
                      styles.activeCategory,
                  ]}
                  onPress={() => setSelectedCategory(category.toLowerCase())}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.toLowerCase() &&
                        styles.activeCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Sort Bar */}
            <BlurView intensity={80} tint="light" style={styles.sortBar}>
              <Text style={styles.resultCount}>
                {filteredProducts.length} products found
              </Text>
              <View style={styles.sortContainer}>
                <Text style={styles.sortLabel}>Sort by:</Text>
                <TouchableOpacity style={styles.sortPicker}>
                  <Text style={styles.sortText}>Best Match</Text>
                  <Feather name="chevron-down" size={16} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            </BlurView>

            {/* Products Grid */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading products...</Text>
              </View>
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    cartItems={cartItems}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                    updateQuantity={updateQuantity}
                  />
                )}
                keyExtractor={(item) => item.uniqueId}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.productsList,
                  { paddingBottom: tabBarHeight + 20 },
                ]}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Feather name="package" size={60} color="#E0E0E0" />
                    <Text style={styles.emptyText}>No products found</Text>
                  </View>
                }
              />
            )}
          </View>

          {/* Cart Modal */}
          <CartModal
            visible={cartVisible}
            onClose={() => setCartVisible(false)}
            cartItems={cartItems}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F9F5",
  },
  container: {
    flex: 1,
  },
  backgroundPattern: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  patternCircle: {
    position: "absolute",
    borderRadius: 1000,
  },
  patternCircle1: {
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  patternCircle2: {
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  patternCircle3: {
    top: 300,
    left: -20,
    width: 100,
    height: 100,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  headerLeft: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    marginRight: 12,
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    padding: 4,
  },
  cartIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B6B",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  categoriesContainer: {
    marginBottom: 4,
  },
  categoriesContent: {
    paddingRight: 16,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeCategory: {
    backgroundColor: "#FFFFFF",
  },
  categoryText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  activeCategoryText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
  },
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 25,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
  },
  sortPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
  },
  productsList: {
    padding: 20,
    paddingTop: 0,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  quantityBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#2E7D32",
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  quantityBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  productDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    lineHeight: 20,
  },
  shopInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  shopLabel: {
    fontSize: 12,
    color: "#666",
    marginRight: 4,
  },
  shopName: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  priceContainer: {
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  addToCartText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  quantityControls: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F8F0",
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F5F9F5",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalHeader: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyCartSubText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  continueButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#2E7D32",
    borderRadius: 25,
  },
  continueButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cartItemsList: {
    flex: 1,
  },
  cartItemsContent: {
    padding: 20,
  },
  addressContainer: {
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  addressInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#F9F9F9",
    minHeight: 60,
    textAlignVertical: "top",
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },
  cartItemDetails: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
    marginBottom: 2,
  },
  cartItemShop: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  cartItemControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cartQuantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2E7D32",
    justifyContent: "center",
    alignItems: "center",
  },
  cartQuantityButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cartQuantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    minWidth: 20,
    textAlign: "center",
  },
  cartFooter: {
    backgroundColor: "#FFF",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: "#666",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
  },
  shopGroupPreview: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
  },
  shopGroupTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  shopGroupItem: {
    marginBottom: 6,
  },
  shopGroupName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  shopGroupItems: {
    fontSize: 12,
    color: "#666",
  },
  cartActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  clearCartButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    alignItems: "center",
  },
  clearCartText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  checkoutButton: {
    flex: 2,
    borderRadius: 25,
    overflow: "hidden",
  },
  checkoutGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  checkoutText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default MerchantShop;
