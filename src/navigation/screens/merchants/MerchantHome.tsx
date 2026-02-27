import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Modal,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView as SafeAreaViewContext } from "react-native-safe-area-context";
import { BASE_URL } from "../../../types/api";
import { getToken, getUserData } from "../../services/authService";

const { width } = Dimensions.get("window");

// Types based on API response
interface Shop {
  id: number;
  shopName: string;
  shopAddress: string;
  description: string;
  owner: {
    name: string;
  };
}

interface Pesticide {
  pesticideId: number;
  name: string;
  price: number;
  photo: {
    url: string;
  };
}

interface PesticidesApiResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    shopId: number;
    name: string;
    Items: Pesticide[];
  };
}

interface ShopsApiResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: Shop[];
}

interface SystemStats {
  pesticideCounts: number;
  shopCounts: number;
}

interface SystemApiResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: SystemStats;
}

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string];
  loading?: boolean;
}> = ({ title, value, icon, gradientColors, loading }) => (
  <LinearGradient
    colors={gradientColors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.metricCard}
  >
    <View style={styles.metricIconContainer}>
      <Ionicons name={icon} size={24} color="#FFF" />
    </View>
    {loading ? (
      <ActivityIndicator
        size="small"
        color="#FFF"
        style={styles.metricLoader}
      />
    ) : (
      <Text style={styles.metricValue}>{value}</Text>
    )}
    <Text style={styles.metricTitle}>{title}</Text>
  </LinearGradient>
);

// Shop Card Component
const ShopCard: React.FC<{
  shop: Shop;
  onPress: () => void;
}> = ({ shop, onPress }) => (
  <TouchableOpacity style={styles.shopCard} onPress={onPress}>
    <LinearGradient
      colors={["#FFFFFF", "#F8F9FF"]}
      style={styles.shopCardGradient}
    >
      <View style={styles.shopCardHeader}>
        <View style={styles.shopIconContainer}>
          <MaterialCommunityIcons name="store" size={24} color="#2E7D32" />
        </View>
        <View style={styles.shopBadge}>
          <Text style={styles.shopBadgeText}>Shop #{shop.id}</Text>
        </View>
      </View>

      <Text style={styles.shopName}>
        {shop.shopName?.trim() || "Unnamed Shop"}
      </Text>

      <View style={styles.shopAddressContainer}>
        <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
        <Text style={styles.shopAddress} numberOfLines={2}>
          {shop.shopAddress}
        </Text>
      </View>

      {shop.description && (
        <Text style={styles.shopDescription} numberOfLines={2}>
          {shop.description}
        </Text>
      )}

      <View style={styles.shopFooter}>
        <View style={styles.shopFooterItem}>
          <Text style={styles.shopFooterLabel}>Owner</Text>
          <Text style={styles.shopFooterValue}>
            {shop.owner?.name?.trim() || "You"}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="#2E7D32" />
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

// Shop Pesticides Modal
const ShopPesticidesModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  shop: Shop | null;
  merchantId: number;
}> = ({ visible, onClose, shop, merchantId }) => {
  const [loading, setLoading] = useState(false);
  const [pesticides, setPesticides] = useState<Pesticide[]>([]);
  const [shopName, setShopName] = useState("");

  // Fetch pesticides when modal opens
  useEffect(() => {
    if (visible && shop && merchantId) {
      fetchPesticides();
    } else {
      // Reset state when modal closes
      setPesticides([]);
      setShopName("");
    }
  }, [visible, shop, merchantId]);

  // const fetchPesticides = async () => {
  //   if (!shop || !merchantId) return;

  //   console.log("=== FETCHING PESTICIDES ===");
  //   console.log("Shop object in modal:", JSON.stringify(shop, null, 2));
  //   console.log("shop.shopId:", shop.shopId);
  //   console.log("merchantId:", merchantId);

  //   setLoading(true);

  //   try {
  //     const token = await getToken();
  //     if (!token) {
  //       Alert.alert("Error", "You are not logged in");
  //       onClose();
  //       return;
  //     }

  //     // Exact API call as requested: /api/merchant/{merchantId}/shops/{shopId}/pesticides
  //     const response = await fetch(
  //       `${BASE_URL}/api/merchant/${merchantId}/shops/${shop.shopId}/pesticides`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       },
  //     );

  //     const responseData: PesticidesApiResponse = await response.json();
  //     console.log(
  //       "Pesticides API Response:",
  //       JSON.stringify(responseData, null, 2),
  //     );

  //     if (responseData.statusCode === 200 && responseData.data) {
  //       setPesticides(responseData.data.Items || []);
  //       setShopName(responseData.data.name || shop.shopName);
  //     } else {
  //       Alert.alert(
  //         "Error",
  //         responseData.message || "Failed to load pesticides",
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching pesticides:", error);
  //     Alert.alert("Error", "Failed to load pesticides");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchPesticides = async () => {
    if (!shop || !merchantId) {
      // console.log("Missing data:", { shop: !!shop, merchantId });
      return;
    }

    // console.log("=== FETCHING PESTICIDES ===");
    // console.log("Shop object in modal:", JSON.stringify(shop, null, 2));
    // console.log("shop.shopId:", shop.id);
    // console.log("merchantId:", merchantId);

    // Check if shopId exists
    if (!shop.id) {
      // console.error("shop.shopId is undefined or null!");
      Alert.alert("Error", "Shop ID is missing. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        onClose();
        return;
      }

      // Build the URL
      const url = `${BASE_URL}/api/merchant/${merchantId}/shops/${shop.id}/pesticides`;
      // console.log("Fetching URL:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const responseData = await response.json();
      // console.log(
      //   "Pesticides API Response:",
      //   JSON.stringify(responseData, null, 2),
      // );

      if (responseData.statusCode === 200 && responseData.data) {
        setPesticides(responseData.data.Items || []);
        setShopName(responseData.data.name || shop.shopName);
      } else {
        Alert.alert(
          "Error",
          responseData.message || "Failed to load pesticides",
        );
      }
    } catch (error) {
      console.error("Error fetching pesticides:", error);
      Alert.alert("Error", "Failed to load pesticides");
    } finally {
      setLoading(false);
    }
  };

  if (!shop) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#1B5E20", "#2E7D32"]}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <View>
                <Text style={styles.modalTitle}>
                  {shopName || shop.shopName}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {pesticides.length} pesticide
                  {pesticides.length !== 1 ? "s" : ""} available
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalBody}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading pesticides...</Text>
              </View>
            ) : pesticides.length > 0 ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.pesticidesGrid}>
                  {pesticides.map((item) => (
                    <View key={item.pesticideId} style={styles.pesticideCard}>
                      <View style={styles.pesticideImageContainer}>
                        {item.photo?.url ? (
                          <Image
                            source={{
                              uri: `${BASE_URL}/uploads/${item.photo.url}`,
                            }}
                            style={styles.pesticideImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.pesticideImagePlaceholder}>
                            <MaterialCommunityIcons
                              name="image-off"
                              size={30}
                              color="#CCC"
                            />
                          </View>
                        )}
                      </View>
                      <View style={styles.pesticideInfo}>
                        <Text style={styles.pesticideName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.pesticidePrice}>
                          {item.price.toLocaleString()} MMK
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={64}
                  color="#CCC"
                />
                <Text style={styles.emptyText}>No pesticides available</Text>
                <Text style={styles.emptySubtext}>
                  This shop doesn't have any pesticides yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main MerchantHome Component
const MerchantHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [merchantName, setMerchantName] = useState("");
  const [merchantId, setMerchantId] = useState<number>(0);
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [pesticidesModalVisible, setPesticidesModalVisible] = useState(false);

  const tabBarHeight = useBottomTabBarHeight();

  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUserData();
      if (userData?.userId) {
        setMerchantId(userData.userId);
        setMerchantName(userData.name || "");
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Fetch data when merchantId is available
  useEffect(() => {
    if (merchantId) {
      fetchShops();
      fetchSystemStats();
    }
  }, [merchantId]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseData: ShopsApiResponse = await response.json();
      // console.log("Shops response:", responseData);

      if (responseData.statusCode === 200 && responseData.data) {
        setShops(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
      Alert.alert("Error", "Failed to load shops");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/system`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseData: SystemApiResponse = await response.json();

      if (responseData.statusCode === 200 && responseData.data) {
        setStats(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching system stats:", error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShops();
    fetchSystemStats();
  }, [merchantId]);

  // Handle shop press - this triggers the API call /api/merchant/{merchantId}/shops/{shopId}/pesticides
  const handleShopPress = (shop: Shop) => {
    // console.log("=== SHOP PRESSED ===");
    // console.log("Full shop object:", JSON.stringify(shop, null, 2));
    // console.log("shop.shopId value:", shop.id);
    // console.log("shopId type:", typeof shop.id);
    // console.log("merchantId:", merchantId);
    setSelectedShop(shop);
    setPesticidesModalVisible(true);
  };

  return (
    <SafeAreaViewContext style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>

      {/* Header */}
      <LinearGradient colors={["#1B5E20", "#2E7D32"]} style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.merchantName}>
              {merchantName || "Merchant"}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.profileButton}>
              <BlurView intensity={80} tint="light" style={styles.profileBlur}>
                <Text style={styles.profileInitials}>
                  {merchantName?.charAt(0) || "M"}
                </Text>
              </BlurView>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1B5E20"]}
            tintColor="#1B5E20"
          />
        }
      >
        {loading && shops.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1B5E20" />
            <Text style={styles.loadingText}>Loading your shops...</Text>
          </View>
        ) : (
          <>
            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Total Shops"
                value={stats?.shopCounts?.toString() || shops.length.toString()}
                icon="storefront"
                gradientColors={["#FF6B6B", "#FF8E8E"]}
                loading={loading}
              />
              <MetricCard
                title="Total Products"
                value={stats?.pesticideCounts?.toString() || "0"}
                icon="cube"
                gradientColors={["#4ECDC4", "#6EE7E7"]}
                loading={loading}
              />
            </View>

            {/* Shops Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Your Shops</Text>
                  <Text style={styles.sectionSubtitle}>
                    {shops.length} shop{shops.length !== 1 ? "s" : ""} • Tap to
                    view pesticides
                  </Text>
                </View>
              </View>

              {shops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onPress={() => handleShopPress(shop)}
                />
              ))}

              {shops.length === 0 && !loading && (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons
                    name="store-off"
                    size={48}
                    color="#CCC"
                  />
                  <Text style={styles.emptyStateText}>No shops found</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Pesticides Modal - This makes the API call when opened */}
      <ShopPesticidesModal
        visible={pesticidesModalVisible}
        onClose={() => setPesticidesModalVisible(false)}
        shop={selectedShop}
        merchantId={merchantId}
      />
    </SafeAreaViewContext>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter-Regular",
  },
  merchantName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    position: "relative",
    marginRight: 15,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B5E20",
  },
  notificationBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
  },
  profileButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  profileBlur: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  profileInitials: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
    fontFamily: "Inter-Regular",
  },
  metricsGrid: {
    flexDirection: "row",
    marginBottom: 25,
    gap: 15,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  metricIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLoader: {
    marginVertical: 10,
  },
  metricValue: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "Inter-Bold",
    marginBottom: 4,
  },
  metricTitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontFamily: "Inter-Regular",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Inter-Bold",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999",
    fontFamily: "Inter-Regular",
    marginTop: 2,
  },
  shopCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  shopCardGradient: {
    padding: 16,
  },
  shopCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  shopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
  },
  shopBadge: {
    backgroundColor: "#2E7D3220",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  shopBadgeText: {
    fontSize: 11,
    color: "#2E7D32",
    fontFamily: "Inter-Medium",
  },
  shopName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "Inter-Bold",
    marginBottom: 8,
  },
  shopAddressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 6,
  },
  shopAddress: {
    fontSize: 13,
    color: "#666",
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  shopDescription: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Inter-Regular",
    marginBottom: 12,
    fontStyle: "italic",
  },
  shopFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  shopFooterItem: {
    alignItems: "center",
  },
  shopFooterLabel: {
    fontSize: 11,
    color: "#999",
    fontFamily: "Inter-Regular",
    marginBottom: 2,
  },
  shopFooterValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E7D32",
    fontFamily: "Inter-SemiBold",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    fontFamily: "Inter-Regular",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: "hidden",
  },
  modalHeader: {
    paddingTop: 20,
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
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Inter-Bold",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter-Regular",
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  pesticidesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  pesticideCard: {
    width: (width - 55) / 2,
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pesticideImageContainer: {
    width: "100%",
    height: 120,
    backgroundColor: "#F5F5F5",
  },
  pesticideImage: {
    width: "100%",
    height: "100%",
  },
  pesticideImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  pesticideInfo: {
    padding: 12,
  },
  pesticideName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Inter-SemiBold",
    marginBottom: 6,
  },
  pesticidePrice: {
    fontSize: 14,
    color: "#2E7D32",
    fontFamily: "Inter-Bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Inter-SemiBold",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
});

export default MerchantHome;
