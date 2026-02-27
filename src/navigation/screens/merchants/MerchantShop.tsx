// import React, { useState, useEffect } from "react";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BASE_URL } from "../../../types/api";
import { getToken, getUserData } from "../../services/authService";

const { width } = Dimensions.get("window");

// Types
interface Shop {
  id: number;
  shopName: string;
  shopAddress: string;
  description: string | null;
}

interface Pesticide {
  id: number;
  name: string;
  price: number;
  info?: string;
  weight?: string;
  ingredients?: string;
  photo?: {
    url: string;
  };
}

// New interface for the merchant's pesticides response
interface MerchantPesticidesResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: Pesticide[];
}

// Main Component
const MerchantShop: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [merchantId, setMerchantId] = useState<number>(0);

  // Data states
  const [availableShops, setAvailableShops] = useState<Shop[]>([]);
  const [availablePesticides, setAvailablePesticides] = useState<Pesticide[]>(
    [],
  );
  const [merchantPesticides, setMerchantPesticides] = useState<Pesticide[]>([]);

  // Loading states
  const [loadingShops, setLoadingShops] = useState(false);
  const [loadingPesticides, setLoadingPesticides] = useState(false);
  const [loadingMerchantPesticides, setLoadingMerchantPesticides] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [selectedShopIds, setSelectedShopIds] = useState<number[]>([]);
  const [selectedPesticideIds, setSelectedPesticideIds] = useState<number[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch merchant ID on mount
  useEffect(() => {
    const fetchMerchantId = async () => {
      const userData = await getUserData();
      if (userData?.userId) {
        setMerchantId(userData.userId);
      }
    };
    fetchMerchantId();
  }, []);

  // Fetch data when merchantId is available
  useEffect(() => {
    if (merchantId) {
      fetchMerchantPesticides();
    }
  }, [merchantId]);

  // Fetch shops when modal opens
  useEffect(() => {
    if (modalVisible && merchantId) {
      fetchShops();
      fetchPesticides();
    }
  }, [modalVisible, merchantId]);

  // Fetch merchant's pesticides using the new endpoint
  const fetchMerchantPesticides = async () => {
    setLoadingMerchantPesticides(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops/pesticides`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responseData: MerchantPesticidesResponse = await response.json();
      // console.log(
      //   "Merchant Pesticides API Response:",
      //   JSON.stringify(responseData, null, 2),
      // );

      if (responseData.statusCode === 200 && responseData.data) {
        setMerchantPesticides(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching merchant pesticides:", error);
    } finally {
      setLoadingMerchantPesticides(false);
      setRefreshing(false);
    }
  };

  // Fetch shops from API
  const fetchShops = async () => {
    setLoadingShops(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const responseData = await response.json();

      if (responseData.statusCode === 200 && responseData.data) {
        const fetchedShops = responseData.data.map((shop: any) => ({
          id: shop.id,
          shopName: shop.shopName?.trim() || "",
          shopAddress: shop.shopAddress,
          description: shop.description,
        }));
        setAvailableShops(fetchedShops);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoadingShops(false);
    }
  };

  // Fetch all pesticides from API
  const fetchPesticides = async () => {
    setLoadingPesticides(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/pesticides`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = await response.json();
      // console.log("All Pesticides API response:", responseData);

      if (responseData.statusCode === 200 && responseData.data) {
        const mappedPesticides = responseData.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          info: item.info,
          weight: item.weight,
          ingredients: item.ingredients,
          photo: item.photo,
        }));
        setAvailablePesticides(mappedPesticides);
      }
    } catch (error) {
      console.error("Error fetching pesticides:", error);
    } finally {
      setLoadingPesticides(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMerchantPesticides();
  }, [merchantId]);

  // Handle form submission
  const handleSubmit = async () => {
    // console.log("Selected Pesticide IDs:", selectedPesticideIds);
    // console.log("Selected Shop IDs:", selectedShopIds);

    if (selectedPesticideIds.length === 0 || selectedShopIds.length === 0) {
      Alert.alert("Error", "Please select at least one shop and one product");
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const pesticides = selectedPesticideIds
        .filter((id) => id != null && !isNaN(id))
        .map((id) => ({ pesticideId: Number(id) }));

      const shops = selectedShopIds
        .filter((id) => id != null && !isNaN(id))
        .map((id) => ({ shopId: Number(id) }));

      if (pesticides.length === 0 || shops.length === 0) {
        Alert.alert("Error", "Invalid IDs selected");
        return;
      }

      const requestBody = {
        merchantId: merchantId,
        pesticides: pesticides,
        shops: shops,
      };

      // console.log("Final Request Body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops/pesticides`,
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
      // console.log("Response:", responseData);

      if (response.ok || responseData.statusCode === 200) {
        Alert.alert("Success", "Products assigned to shops successfully!");
        handleCloseModal();
        // Refresh the merchant's pesticides list
        fetchMerchantPesticides();
      } else {
        throw new Error(responseData.message || "Failed to assign products");
      }
    } catch (error) {
      console.error("Error submitting:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to assign products",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedShopIds([]);
    setSelectedPesticideIds([]);
    setFormStep(1);
    setSearchQuery("");
  };

  const toggleShop = (shopId: number) => {
    setSelectedShopIds((prev) =>
      prev.includes(shopId)
        ? prev.filter((id) => id !== shopId)
        : [...prev, shopId],
    );
  };

  const togglePesticide = (pesticideId: number) => {
    if (!pesticideId) return;
    setSelectedPesticideIds((prev) =>
      prev.includes(pesticideId)
        ? prev.filter((id) => id !== pesticideId)
        : [...prev, pesticideId],
    );
  };

  const filteredPesticides = availablePesticides.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pesticide Card Component for displaying merchant's pesticides
  const PesticideCard: React.FC<{ pesticide: Pesticide }> = ({ pesticide }) => (
    <View style={styles.pesticideCard}>
      <View style={styles.pesticideImageContainer}>
        {pesticide.photo?.url ? (
          <Image
            source={{ uri: `${BASE_URL}/uploads/${pesticide.photo.url}` }}
            style={styles.pesticideImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.pesticideImagePlaceholder}>
            <Feather name="package" size={30} color="#CCC" />
          </View>
        )}
      </View>
      <View style={styles.pesticideInfo}>
        <Text style={styles.pesticideName} numberOfLines={2}>
          {pesticide.name}
        </Text>
        <Text style={styles.pesticidePrice}>
          {pesticide.price?.toLocaleString()} MMK
        </Text>
        {pesticide.weight && (
          <Text style={styles.pesticideDetail}>{pesticide.weight}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={["#1B5E20", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Shop</Text>
              <Text style={styles.headerSubtitle}>Manage your products</Text>
            </View>

            {/* Add Product Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Feather name="plus" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Products to Shops</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Pesticides List */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1B5E20"]}
                tintColor="#1B5E20"
              />
            }
          >
            {loadingMerchantPesticides ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading your products...</Text>
              </View>
            ) : merchantPesticides.length > 0 ? (
              <View style={styles.pesticidesGrid}>
                {merchantPesticides.map((pesticide) => (
                  <PesticideCard key={pesticide.id} pesticide={pesticide} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Feather name="package" size={64} color="#CCC" />
                <Text style={styles.emptyTitle}>No Products Yet</Text>
                <Text style={styles.emptyText}>
                  Tap the "Add Products to Shops" button to add your first
                  products
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Add Product Modal (existing code remains the same) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <BlurView intensity={100} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <LinearGradient
              colors={["#1B5E20", "#2E7D32"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Add Products to Shops</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    formStep >= 1 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      formStep >= 1 && styles.stepTextActive,
                    ]}
                  >
                    1
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Select Shops</Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  formStep >= 2 && styles.stepLineActive,
                ]}
              />
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    formStep >= 2 && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      formStep >= 2 && styles.stepTextActive,
                    ]}
                  >
                    2
                  </Text>
                </View>
                <Text style={styles.stepLabel}>Select Products</Text>
              </View>
            </View>

            <ScrollView style={styles.modalBody}>
              {formStep === 1 ? (
                // Step 1: Select Shops
                <View>
                  <Text style={styles.sectionTitle}>Select Shops</Text>
                  <Text style={styles.sectionSubtitle}>
                    Choose the shops where these products will be available
                  </Text>

                  {loadingShops ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#2E7D32" />
                      <Text style={styles.loadingText}>Loading shops...</Text>
                    </View>
                  ) : availableShops.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No shops available</Text>
                    </View>
                  ) : (
                    availableShops.map((shop) => (
                      <TouchableOpacity
                        key={shop.id}
                        style={[
                          styles.selectionCard,
                          selectedShopIds.includes(shop.id) &&
                            styles.selectionCardActive,
                        ]}
                        onPress={() => toggleShop(shop.id)}
                      >
                        <View style={styles.selectionCardContent}>
                          <View style={styles.selectionIcon}>
                            <Feather
                              name="shopping-bag"
                              size={20}
                              color={
                                selectedShopIds.includes(shop.id)
                                  ? "#2E7D32"
                                  : "#666"
                              }
                            />
                          </View>
                          <View style={styles.selectionInfo}>
                            <Text style={styles.selectionTitle}>
                              {shop.shopName}
                            </Text>
                            <Text style={styles.selectionSubtitle}>
                              {shop.shopAddress}
                            </Text>
                            {shop.description && (
                              <Text style={styles.selectionDescription}>
                                {shop.description}
                              </Text>
                            )}
                          </View>
                        </View>
                        {selectedShopIds.includes(shop.id) && (
                          <Feather
                            name="check-circle"
                            size={24}
                            color="#2E7D32"
                          />
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              ) : (
                // Step 2: Select Products
                <View>
                  <Text style={styles.sectionTitle}>Select Products</Text>
                  <Text style={styles.sectionSubtitle}>
                    Choose the pesticides to assign to selected shops
                  </Text>

                  {/* Search Bar */}
                  <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#999" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search products..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      placeholderTextColor="#999"
                    />
                    {searchQuery !== "" && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Feather name="x" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {loadingPesticides ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color="#2E7D32" />
                      <Text style={styles.loadingText}>
                        Loading products...
                      </Text>
                    </View>
                  ) : availablePesticides.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>
                        No products available
                      </Text>
                    </View>
                  ) : (
                    <View>
                      {filteredPesticides.map((pesticide) => (
                        <TouchableOpacity
                          key={pesticide.id}
                          style={[
                            styles.selectionCard,
                            selectedPesticideIds.includes(pesticide.id) &&
                              styles.selectionCardActive,
                          ]}
                          onPress={() => togglePesticide(pesticide.id)}
                        >
                          <View style={styles.selectionCardContent}>
                            <View style={styles.selectionIcon}>
                              <Feather
                                name="package"
                                size={20}
                                color={
                                  selectedPesticideIds.includes(pesticide.id)
                                    ? "#2E7D32"
                                    : "#666"
                                }
                              />
                            </View>
                            <View style={styles.selectionInfo}>
                              <Text style={styles.selectionTitle}>
                                {pesticide.name}
                              </Text>
                              <Text style={styles.selectionSubtitle}>
                                {pesticide.price?.toLocaleString()} MMK
                              </Text>
                            </View>
                          </View>
                          {selectedPesticideIds.includes(pesticide.id) && (
                            <Feather
                              name="check-circle"
                              size={24}
                              color="#2E7D32"
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              {formStep === 1 ? (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.nextButton,
                      selectedShopIds.length === 0 && styles.disabledButton,
                    ]}
                    onPress={() => setFormStep(2)}
                    disabled={selectedShopIds.length === 0}
                  >
                    <Text style={styles.nextButtonText}>
                      Next ({selectedShopIds.length} shops)
                    </Text>
                    <Feather name="arrow-right" size={20} color="#FFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setFormStep(1)}
                  >
                    <Feather name="arrow-left" size={20} color="#666" />
                    <Text style={styles.backButtonText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (selectedPesticideIds.length === 0 || submitting) &&
                        styles.disabledButton,
                    ]}
                    onPress={handleSubmit}
                    disabled={selectedPesticideIds.length === 0 || submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.submitButtonText}>
                        Submit ({selectedPesticideIds.length} products)
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Selected Items Summary */}
            {(selectedShopIds.length > 0 ||
              selectedPesticideIds.length > 0) && (
              <View style={styles.summaryBar}>
                <Feather name="info" size={16} color="#2E7D32" />
                <Text style={styles.summaryText}>
                  {selectedShopIds.length} shops, {selectedPesticideIds.length}{" "}
                  products selected
                </Text>
              </View>
            )}
          </View>
        </BlurView>
      </Modal>
    </SafeAreaProvider>
  );
};

// Add these new styles to your existing styles object
const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  pesticidesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
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
    marginBottom: 15,
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
    backgroundColor: "#FAFAFA",
  },
  pesticideInfo: {
    padding: 12,
  },
  pesticideName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  pesticidePrice: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "700",
    marginBottom: 2,
  },
  pesticideDetail: {
    fontSize: 12,
    color: "#999",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: width * 0.95,
    maxHeight: "80%",
    backgroundColor: "#FFF",
    borderRadius: 25,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F9F5",
  },
  stepItem: {
    alignItems: "center",
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#2E7D32",
  },
  stepText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
  },
  stepTextActive: {
    color: "#FFF",
  },
  stepLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 10,
  },
  stepLineActive: {
    backgroundColor: "#2E7D32",
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#999",
    marginBottom: 20,
  },
  selectionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectionCardActive: {
    borderColor: "#2E7D32",
    backgroundColor: "#F0F7F0",
  },
  selectionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectionInfo: {
    flex: 1,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  selectionDescription: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
    fontStyle: "italic",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F9F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#333",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  nextButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  backButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#C8E6C9",
  },
  summaryText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
});
// });

// Merge the new styles with existing ones

export default MerchantShop;
