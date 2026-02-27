import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { width } = Dimensions.get("window");

// Types
interface OrderItem {
  pesticidesId: number;
  name: string;
  price: number;
  quantity: number;
  photo: { url: string };
  shopName: string;
}

interface Order {
  id: string;
  date: string;
  status: "delivered" | "processing" | "shipped" | "cancelled";
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  deliveryAddress: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

// Sample Orders Data
const sampleOrders: Order[] = [
  {
    id: "ORD-2026-001",
    date: "2026-12-15",
    status: "delivered",
    totalAmount: 87.4,
    paymentMethod: "Credit Card",
    deliveryAddress: "Green Farm, Plot 24, Sangrur",
    items: [
      {
        pesticidesId: 6,
        name: "PaiDi(Awba)",
        price: 77.4,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAmqRL_OJhhWt-3Yh3JBeVqr56l8lHJi03pw&s",
        },
        shopName: "Green Valley Agro Shop",
      },
      {
        pesticidesId: 11,
        name: "Hacker",
        price: 10,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRN2dkkGFDRij-9fp7PnYlw-N9AtpPTrtgkHw&s",
        },
        shopName: "SH-10",
      },
    ],
    trackingNumber: "TRK7890123456",
  },
  {
    id: "ORD-2026-002",
    date: "2026-12-18",
    status: "shipped",
    totalAmount: 54.77,
    paymentMethod: "UPI",
    deliveryAddress: "Yangon",
    estimatedDelivery: "2026-11-22",
    items: [
      {
        pesticidesId: 1,
        name: "Zai Zar lone",
        price: 13.6,
        quantity: 2,
        photo: {
          url: "data:image/jpeg;base64,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",
        },
        shopName: "Green Valley Agro Shop",
      },
      {
        pesticidesId: 3,
        name: "kaw mat",
        price: 14.77,
        quantity: 1,
        photo: {
          url: "data:image/jpeg;base64,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m2+hPUyXSjGWyAk1zuFeFQG4Ie/Xgcecq4decV7wt2FGwIeCbYlh1NeRm2PGchZTtA6KV2rypPzIOel9RxJqjW+UZZ9PQWi1ZXK2cgVvCQFC1QtaJuluvpJsVHMu7jIQLUAFTY53cjbY5MqLmON2NDYBa/IzmgFW2FlRdf2lhH7xx0GMjk+FXG4EHngtR/OVm9u62vt/X5EGvwpvxgG+F2qRSsDzZa/M9eJWtm2F7V7amAs8Nxa2OhsAy9lwbCo4IAAYna5s8nap5H5SB87ZSpUKos7gdobwmxWQ+xHSTTOls459fUfV/h+v5bFQApaNV8wsN0/8rnRnnvgrIBp+6u+7JrmzsYllJ9epF+09DPp9lrivBpqib5Q86uLVTBEROhQiIgIiICIiAiIgIiICImDAzPLfG/bmPFiOnDE58o27UI3Kp4LH0vkD/aegzB/szzPb3w4+oYMbDCuUNbq6Bh0Mxx6a6sOYo1laiYiby8lqWXbyC3iYE42Wt/mW4/5zJ9bkpWOQg4yylQvF+Hql9BtoGXsfwbqMf+GxU2TfU10C/TrJNV8O6xloMV9weSK5v8eZ4UfTtoptERePF29vQ42uyp3RB3cKm4Arv287LNf5fzE5TZD3dgjue7YV730/z7qNzt5fgnUmyDTEKLHkR1YD1P8ArMt8Ia3bW9t33+Lu+vpVcVJp+nY1MWiOPGfnVHb0OFp86d2K3WQ+wFl3dPHtNcX5e9yjpM5IHckBQ9tvokDb1auq1undP8P9SSCxLMN3J875BP0JM3wfA2tUUcjN9fIV0Fe9G/aaf+fixE2jU7ehwOy9TipuoXcvzkbd1+GhVjz/AA9Yx5rbIMdjJ9reQWNN4tpAHnX4TrN/DrVN/iOXNg2aBodV48jLGn+BtapPjO02QvG1b/vLTsGLeZj1O3oc3S507593LUd5UjYRQD8VfX9ZbORTmG0+MjwFiCny+DaAOP8AWWn+BdWxO52ZSCAprw3yCD7VLOm+DNWhG1iEAAKg8NXmT7mZz9OxtbZ2tqdvRzUMZ8eMNZyUtbCARz4d9g81+kx2g+K0PO2zVEbB4vFYq/8Aap2H+FNYxFv4RVr9k+p9rmuH4I1C1TstXZUgE35GwelSI+nY8zEzFvPLidvQx2H2+2kyl89NjclaX5gOD3i+q9OPc/j9OxvuAI6EAi+Dz7HpPH9nfD+XEQQiluOXtjx5i+Afeeh065/tET1diwMTBo3a7eTmxa4qm8OjE0x35zedjIiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiAiIgIiICIiB//2Q==",
        },
        shopName: "Sunrise Farming Store",
      },
      {
        pesticidesId: 7,
        name: "Kaw Mat Lite",
        price: 12.4,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3FOtbP08olEVTz_CAHcLPElbQG9iZXNHHng&s",
        },
        shopName: "SH-7",
      },
    ],
    trackingNumber: "TRK1237894560",
  },
  {
    id: "ORD-2026-003",
    date: "2026-3-20",
    status: "processing",
    totalAmount: 23.0,
    paymentMethod: "Cash on Delivery",
    deliveryAddress: "Green Farm, Plot 24, Mdy",
    estimatedDelivery: "2026-3-24",
    items: [
      {
        pesticidesId: 2,
        name: "Hacker",
        price: 8.0,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRExgJU1PYFZE24bWEr8_CSrAmIVM_Lvirukw&s",
        },
        shopName: "SH-7",
      },
      {
        pesticidesId: 4,
        name: "Fight (Myanmar)",
        price: 15.0,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHg9hIXA5G-qvZ3hNGrJ1heTwFFR1ldKerXA&s",
        },
        shopName: "Green Valley Agro Shop",
      },
    ],
  },
  {
    id: "ORD-2026-004",
    date: "2026-2-26",
    status: "cancelled",
    totalAmount: 9.0,
    paymentMethod: "UPI",
    deliveryAddress: "PyiGyiTaGon, Mdy",
    items: [
      {
        pesticidesId: 12,
        name: "Fortune",
        price: 9.0,
        quantity: 1,
        photo: {
          url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrndWpXE4PDE_Jvz3r1NOvAYieTvs5H00a9w&s",
        },
        shopName: "Sunrise Farming Store",
      },
    ],
  },
];

// Status Badge Component
const StatusBadge: React.FC<{ status: Order["status"] }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case "delivered":
        return "#4CAF50";
      case "processing":
        return "#FFA000";
      case "shipped":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusBg = () => {
    switch (status) {
      case "delivered":
        return "rgba(76, 175, 80, 0.1)";
      case "processing":
        return "rgba(255, 160, 0, 0.1)";
      case "shipped":
        return "rgba(33, 150, 243, 0.1)";
      case "cancelled":
        return "rgba(244, 67, 54, 0.1)";
      default:
        return "rgba(153, 153, 153, 0.1)";
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusBg() }]}>
      <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.statusText, { color: getStatusColor() }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

// Order Card Component
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderDate}>
            <Feather name="calendar" size={12} color="#666" /> {order.date}
          </Text>
        </View>
        <View style={styles.orderHeaderRight}>
          <StatusBadge status={order.status} />
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#666"
          />
        </View>
      </TouchableOpacity>

      {/* Order Items Preview */}
      <View style={styles.itemsPreview}>
        {order.items.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.previewItem}>
            <Image
              source={{ uri: item.photo.url }}
              style={styles.previewImage}
            />
            <View style={styles.previewInfo}>
              <Text style={styles.previewName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.previewQuantity}>x{item.quantity}</Text>
            </View>
          </View>
        ))}
        {order.items.length > 2 && (
          <View style={styles.moreItemsBadge}>
            <Text style={styles.moreItemsText}>
              +{order.items.length - 2} more
            </Text>
          </View>
        )}
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={styles.expandedDetails}>
          <View style={styles.divider} />

          {/* All Items */}
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items.map((item, index) => (
            <View key={index} style={styles.expandedItem}>
              <Image
                source={{ uri: item.photo.url }}
                style={styles.expandedItemImage}
              />
              <View style={styles.expandedItemInfo}>
                <Text style={styles.expandedItemName}>{item.name}</Text>
                <Text style={styles.expandedItemShop}>{item.shopName}</Text>
                <View style={styles.expandedItemDetails}>
                  <Text style={styles.expandedItemPrice}>
                    ${item.price.toFixed(2)} × {item.quantity}
                  </Text>
                  <Text style={styles.expandedItemTotal}>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Order Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${order.totalAmount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>Free</Text>
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ${order.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Payment & Delivery */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Feather name="credit-card" size={16} color="#666" />
              <Text style={styles.infoLabel}>Payment:</Text>
              <Text style={styles.infoValue}>{order.paymentMethod}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color="#666" />
              <Text style={styles.infoLabel}>Delivery:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>
            </View>

            {order.estimatedDelivery && (
              <View style={styles.infoRow}>
                <Feather name="truck" size={16} color="#666" />
                <Text style={styles.infoLabel}>Est. Delivery:</Text>
                <Text style={styles.infoValue}>{order.estimatedDelivery}</Text>
              </View>
            )}

            {order.trackingNumber && (
              <View style={styles.infoRow}>
                <Feather name="package" size={16} color="#666" />
                <Text style={styles.infoLabel}>Tracking:</Text>
                <Text style={styles.infoValue}>{order.trackingNumber}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {order.status === "delivered" && (
              <>
                <TouchableOpacity style={styles.reorderButton}>
                  <Feather name="rotate-cw" size={16} color="#2E7D32" />
                  <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.reviewButton}>
                  <Feather name="star" size={16} color="#FFA000" />
                  <Text style={styles.reviewButtonText}>Review</Text>
                </TouchableOpacity>
              </>
            )}
            {order.status === "processing" && (
              <TouchableOpacity style={styles.trackButton}>
                <Feather name="map" size={16} color="#2E7D32" />
                <Text style={styles.trackButtonText}>Track Order</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.supportButton}>
              <Feather name="help-circle" size={16} color="#2E7D32" />
              <Text style={styles.supportButtonText}>Need Help?</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Main Component
const History: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const tabBarHeight = useBottomTabBarHeight();

  const filters = [
    { id: "all", label: "All Orders", icon: "clock" },
    { id: "processing", label: "Processing", icon: "loader" },
    { id: "shipped", label: "Shipped", icon: "truck" },
    { id: "delivered", label: "Delivered", icon: "check-circle" },
    { id: "cancelled", label: "Cancelled", icon: "x-circle" },
  ];

  const filteredOrders = sampleOrders.filter((order) =>
    selectedFilter === "all" ? true : order.status === selectedFilter,
  );

  const getFilterIcon = (iconName: string, isActive: boolean) => {
    return (
      <Feather
        name={iconName as any}
        size={18}
        color={isActive ? "#FFF" : "#666"}
      />
    );
  };

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
          {/* Header */}
          <LinearGradient
            colors={["#1B5E20", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Order History</Text>
              <Text style={styles.headerSubtitle}>Your farming purchases</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <BlurView intensity={80} tint="light" style={styles.searchBlur}>
                <Feather name="search" size={20} color="#70AB6D" />
                <Text style={styles.searchPlaceholder}>
                  Search in your orders...
                </Text>
              </BlurView>
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.id && styles.activeFilter,
                  ]}
                  onPress={() => setSelectedFilter(filter.id)}
                >
                  {getFilterIcon(filter.icon, selectedFilter === filter.id)}
                  <Text
                    style={[
                      styles.filterText,
                      selectedFilter === filter.id && styles.activeFilterText,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Stats Summary */}
            <BlurView intensity={80} tint="light" style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{sampleOrders.length}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  $
                  {sampleOrders
                    .reduce((sum, order) => sum + order.totalAmount, 0)
                    .toFixed(2)}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
            </BlurView>

            {/* Orders List */}
            {filteredOrders.length > 0 ? (
              <FlatList
                data={filteredOrders}
                renderItem={({ item }) => <OrderCard order={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.ordersList,
                  { paddingBottom: tabBarHeight + 20 },
                ]}
                ListFooterComponent={<View style={{ height: tabBarHeight }} />}
              />
            ) : (
              <View style={styles.emptyState}>
                <Feather name="package" size={80} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No orders found</Text>
                <Text style={styles.emptyStateText}>
                  {selectedFilter === "all"
                    ? "You haven't placed any orders yet"
                    : `No ${selectedFilter} orders at the moment`}
                </Text>
                <TouchableOpacity style={styles.shopButton}>
                  <LinearGradient
                    colors={["#2E7D32", "#1B5E20"]}
                    style={styles.shopButtonGradient}
                  >
                    <Text style={styles.shopButtonText}>Browse Products</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    marginBottom: 15,
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
  searchContainer: {
    borderRadius: 25,
    overflow: "hidden",
    marginBottom: 15,
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#999",
  },
  filtersContainer: {
    marginBottom: 4,
  },
  filtersContent: {
    paddingRight: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    gap: 6,
  },
  activeFilter: {
    backgroundColor: "#FFFFFF",
  },
  filterText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  activeFilterText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
  mainContent: {
    flex: 1,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E0E0",
  },
  ordersList: {
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderHeaderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: "#666",
  },
  orderHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  itemsPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 6,
  },
  previewImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
    marginRight: 6,
  },
  previewInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewName: {
    fontSize: 12,
    color: "#333",
    flex: 1,
    marginRight: 4,
  },
  previewQuantity: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  moreItemsBadge: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  moreItemsText: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  expandedDetails: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  expandedItem: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  expandedItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  expandedItemInfo: {
    flex: 1,
  },
  expandedItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  expandedItemShop: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  expandedItemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandedItemPrice: {
    fontSize: 12,
    color: "#666",
  },
  expandedItemTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2E7D32",
  },
  summarySection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: "#666",
  },
  summaryValue: {
    fontSize: 13,
    color: "#333",
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  infoSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    width: 70,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(46, 125, 50, 0.1)",
    borderRadius: 20,
    gap: 4,
  },
  reorderButtonText: {
    fontSize: 12,
    color: "#2E7D32",
    fontWeight: "600",
  },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 160, 0, 0.1)",
    borderRadius: 20,
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 12,
    color: "#FFA000",
    fontWeight: "600",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    borderRadius: 20,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "600",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(102, 102, 102, 0.1)",
    borderRadius: 20,
    gap: 4,
  },
  supportButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginTop: 50,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  shopButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  shopButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  shopButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default History;
