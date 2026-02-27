import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
  Alert,
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

// Types based on actual API response
interface ApiOrderItem {
  pesticidesId: number;
  name: string;
  price: number;
  quantity: number;
  photo: {
    url: string;
  };
}

interface ApiOrder {
  id: number; // Note: id is number in API response
  date: string;
  totalAmount: number;
  deliveryAddress: string;
  items: ApiOrderItem[];
  shopName: string; // Shop name at order level
}

interface ApiResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: ApiOrder[];
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
}

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
  totalAmount: number;
  deliveryAddress: string;
  items: OrderItem[];
  status: "delivered" | "processing" | "shipped" | "cancelled";
}

// Default image for products without photos
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400";

// Helper function to get image URL
const getImageUrl = (photoUrl: string) => {
  if (!photoUrl) return DEFAULT_IMAGE;
  if (photoUrl.startsWith("data:") || photoUrl.startsWith("http")) {
    return photoUrl;
  }
  // Remove any leading slash and construct full URL
  const cleanPath = photoUrl.startsWith("/") ? photoUrl.substring(1) : photoUrl;
  return `${BASE_URL}/uploads/${cleanPath}`;
};

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
// const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <View style={styles.orderCard}>
//       <TouchableOpacity
//         style={styles.orderHeader}
//         onPress={() => setExpanded(!expanded)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.orderHeaderLeft}>
//           <Text style={styles.orderId}>Order #{order.id}</Text>
//           <Text style={styles.orderDate}>
//             <Feather name="calendar" size={12} color="#666" /> {order.date}
//           </Text>
//         </View>
//         <View style={styles.orderHeaderRight}>
//           <StatusBadge status={order.status} />
//           <Feather
//             name={expanded ? "chevron-up" : "chevron-down"}
//             size={20}
//             color="#666"
//           />
//         </View>
//       </TouchableOpacity>

//       {/* Order Items Preview */}
//       <View style={styles.itemsPreview}>
//         {order.items.slice(0, 2).map((item, index) => (
//           <View key={index} style={styles.previewItem}>
//             <Image
//               source={{ uri: getImageUrl(item.photo.url) }}
//               style={styles.previewImage}
//             />
//             <View style={styles.previewInfo}>
//               <Text style={styles.previewName} numberOfLines={1}>
//                 {item.name}
//               </Text>
//               <Text style={styles.previewQuantity}>x{item.quantity}</Text>
//             </View>
//           </View>
//         ))}
//         {order.items.length > 2 && (
//           <View style={styles.moreItemsBadge}>
//             <Text style={styles.moreItemsText}>
//               +{order.items.length - 2} more
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Expanded Details */}
//       {expanded && (
//         <View style={styles.expandedDetails}>
//           <View style={styles.divider} />

//           {/* All Items */}
//           <Text style={styles.sectionTitle}>Order Items</Text>
//           {order.items.map((item, index) => (
//             <View key={index} style={styles.expandedItem}>
//               <Image
//                 source={{ uri: getImageUrl(item.photo.url) }}
//                 style={styles.expandedItemImage}
//               />
//               <View style={styles.expandedItemInfo}>
//                 <Text style={styles.expandedItemName}>{item.name}</Text>
//                 <Text style={styles.expandedItemShop}>{item.shopName}</Text>
//                 <View style={styles.expandedItemDetails}>
//                   <Text style={styles.expandedItemPrice}>
//                     ${item.price.toFixed(2)} × {item.quantity}
//                   </Text>
//                   <Text style={styles.expandedItemTotal}>
//                     ${(item.price * item.quantity).toFixed(2)}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))}

//           {/* Order Summary */}
//           <View style={styles.summarySection}>
//             <Text style={styles.sectionTitle}>Order Summary</Text>

//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Total Amount</Text>
//               <Text style={styles.totalValue}>
//                 ${order.totalAmount.toFixed(2)}
//               </Text>
//             </View>
//           </View>

//           {/* Delivery Info */}
//           <View style={styles.infoSection}>
//             <View style={styles.infoRow}>
//               <Feather name="map-pin" size={16} color="#666" />
//               <Text style={styles.infoLabel}>Delivery:</Text>
//               <Text style={styles.infoValue} numberOfLines={2}>
//                 {order.deliveryAddress}
//               </Text>
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             {order.status === "delivered" && (
//               <>
//                 <TouchableOpacity style={styles.reorderButton}>
//                   <Feather name="rotate-cw" size={16} color="#2E7D32" />
//                   <Text style={styles.reorderButtonText}>Reorder</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.reviewButton}>
//                   <Feather name="star" size={16} color="#FFA000" />
//                   <Text style={styles.reviewButtonText}>Review</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//             {order.status === "processing" && (
//               <TouchableOpacity style={styles.trackButton}>
//                 <Feather name="map" size={16} color="#2E7D32" />
//                 <Text style={styles.trackButtonText}>Track Order</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity style={styles.supportButton}>
//               <Feather name="help-circle" size={16} color="#2E7D32" />
//               <Text style={styles.supportButtonText}>Need Help?</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// Order Card Component
// const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
//   const [expanded, setExpanded] = useState(false);

//   // Calculate total from items to ensure accuracy
//   const calculatedTotal = order.items.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );

//   return (
//     <View style={styles.orderCard}>
//       <TouchableOpacity
//         style={styles.orderHeader}
//         onPress={() => setExpanded(!expanded)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.orderHeaderLeft}>
//           <Text style={styles.orderId}>Order #{order.id}</Text>
//           <Text style={styles.orderDate}>
//             <Feather name="calendar" size={12} color="#666" /> {order.date}
//           </Text>
//         </View>
//         <View style={styles.orderHeaderRight}>
//           <StatusBadge status={order.status} />
//           <Feather
//             name={expanded ? "chevron-up" : "chevron-down"}
//             size={20}
//             color="#666"
//           />
//         </View>
//       </TouchableOpacity>

//       {/* Order Items Preview */}
//       <View style={styles.itemsPreview}>
//         {order.items.slice(0, 2).map((item, index) => (
//           <View key={index} style={styles.previewItem}>
//             <Image
//               source={{ uri: getImageUrl(item.photo.url) }}
//               style={styles.previewImage}
//             />
//             <View style={styles.previewInfo}>
//               <Text style={styles.previewName} numberOfLines={1}>
//                 {item.name}
//               </Text>
//               <Text style={styles.previewQuantity}>x{item.quantity}</Text>
//             </View>
//           </View>
//         ))}
//         {order.items.length > 2 && (
//           <View style={styles.moreItemsBadge}>
//             <Text style={styles.moreItemsText}>
//               +{order.items.length - 2} more
//             </Text>
//           </View>
//         )}
//       </View>

//       {/* Show a warning if totals don't match (optional) */}
//       {Math.abs(calculatedTotal - order.totalAmount) > 0.01 && (
//         <View style={styles.totalWarning}>
//           <Text style={styles.totalWarningText}>
//             Note: Order total may need recalculation
//           </Text>
//         </View>
//       )}

//       {/* Expanded Details */}
//       {expanded && (
//         <View style={styles.expandedDetails}>
//           <View style={styles.divider} />

//           {/* All Items */}
//           <Text style={styles.sectionTitle}>Order Items</Text>
//           {order.items.map((item, index) => (
//             <View key={index} style={styles.expandedItem}>
//               <Image
//                 source={{ uri: getImageUrl(item.photo.url) }}
//                 style={styles.expandedItemImage}
//               />
//               <View style={styles.expandedItemInfo}>
//                 <Text style={styles.expandedItemName}>{item.name}</Text>
//                 <Text style={styles.expandedItemShop}>{item.shopName}</Text>
//                 <View style={styles.expandedItemDetails}>
//                   <Text style={styles.expandedItemPrice}>
//                     ${item.price.toFixed(2)} × {item.quantity}
//                   </Text>
//                   <Text style={styles.expandedItemTotal}>
//                     ${(item.price * item.quantity).toFixed(2)}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           ))}

//           {/* Order Summary */}
//           <View style={styles.summarySection}>
//             <Text style={styles.sectionTitle}>Order Summary</Text>

//             {/* Show subtotal from items */}
//             <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>
//                 Subtotal ({order.items.length} items)
//               </Text>
//               <Text style={styles.summaryValue}>
//                 ${calculatedTotal.toFixed(2)}
//               </Text>
//             </View>

//             {/* You can add other charges here if needed */}
//             {/* <View style={styles.summaryRow}>
//               <Text style={styles.summaryLabel}>Delivery Fee</Text>
//               <Text style={styles.summaryValue}>$5.00</Text>
//             </View> */}

//             <View style={styles.summaryDivider} />

//             <View style={styles.summaryRow}>
//               <Text style={styles.totalLabel}>Total Amount</Text>
//               <Text style={styles.totalValue}>
//                 ${calculatedTotal.toFixed(2)}
//               </Text>
//             </View>
//           </View>

//           {/* Delivery Info */}
//           <View style={styles.infoSection}>
//             <View style={styles.infoRow}>
//               <Feather name="map-pin" size={16} color="#666" />
//               <Text style={styles.infoLabel}>Delivery:</Text>
//               <Text style={styles.infoValue} numberOfLines={2}>
//                 {order.deliveryAddress}
//               </Text>
//             </View>
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.actionButtons}>
//             {order.status === "delivered" && (
//               <>
//                 <TouchableOpacity style={styles.reorderButton}>
//                   <Feather name="rotate-cw" size={16} color="#2E7D32" />
//                   <Text style={styles.reorderButtonText}>Reorder</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.reviewButton}>
//                   <Feather name="star" size={16} color="#FFA000" />
//                   <Text style={styles.reviewButtonText}>Review</Text>
//                 </TouchableOpacity>
//               </>
//             )}
//             {order.status === "processing" && (
//               <TouchableOpacity style={styles.trackButton}>
//                 <Feather name="map" size={16} color="#2E7D32" />
//                 <Text style={styles.trackButtonText}>Track Order</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity style={styles.supportButton}>
//               <Feather name="help-circle" size={16} color="#2E7D32" />
//               <Text style={styles.supportButtonText}>Need Help?</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// Order Card Component
const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  // Optional: You can still calculate to verify, but now order.totalAmount should be correct
  const calculatedTotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId}>Order #{order.id}</Text>
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
              source={{ uri: getImageUrl(item.photo.url) }}
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
                source={{ uri: getImageUrl(item.photo.url) }}
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

            {/* Show item count */}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Subtotal ({order.items.length} items)
              </Text>
              <Text style={styles.summaryValue}>
                ${calculatedTotal.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ${order.totalAmount.toFixed(2)}{" "}
                {/* Now this matches calculatedTotal */}
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color="#666" />
              <Text style={styles.infoLabel}>Delivery:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {order.deliveryAddress}
              </Text>
            </View>
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
// const History: React.FC = () => {
//   const [selectedFilter, setSelectedFilter] = useState("all");
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [farmerId, setFarmerId] = useState<number | null>(null);
//   const tabBarHeight = useBottomTabBarHeight();

//   // Determine order status based on date
//   const determineOrderStatus = (orderDate: string): Order["status"] => {
//     const date = new Date(orderDate);
//     const now = new Date();
//     const daysDiff = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
//     );

//     if (daysDiff < 2) return "processing";
//     if (daysDiff < 5) return "shipped";
//     return "delivered";
//   };

//   // Fetch farmer ID on mount
//   useEffect(() => {
//     const fetchFarmerId = async () => {
//       const userData = await getUserData();
//       if (userData?.userId) {
//         setFarmerId(userData.userId);
//       }
//     };
//     fetchFarmerId();
//   }, []);

//   // Fetch orders when farmerId is available
//   useEffect(() => {
//     if (farmerId) {
//       fetchOrders();
//     }
//   }, [farmerId]);

//   const fetchOrders = async () => {
//     setLoading(true);
//     try {
//       const token = await getToken();
//       if (!token) {
//         Alert.alert("Error", "You are not logged in");
//         return;
//       }

//       const response = await fetch(
//         `${BASE_URL}/api/farmer/${farmerId}/orders`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const responseData: ApiResponse = await response.json();
//       console.log("Orders fetched:", responseData);

//       if (responseData.statusCode === 200 && responseData.data) {
//         // Transform API data to our Order type
//         const transformedOrders: Order[] = responseData.data.map(
//           (apiOrder) => ({
//             id: apiOrder.id.toString(),
//             date: apiOrder.date,
//             totalAmount: apiOrder.totalAmount,
//             deliveryAddress: apiOrder.deliveryAddress,
//             items: apiOrder.items.map((item) => ({
//               ...item,
//               shopName: apiOrder.shopName, // Use shop name from order level
//             })),
//             status: determineOrderStatus(apiOrder.date),
//           }),
//         );

//         setOrders(transformedOrders);
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       Alert.alert("Error", "Failed to load orders");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchOrders();
//   };

//   const filters = [
//     { id: "all", label: "All Orders", icon: "clock" },
//     { id: "processing", label: "Processing", icon: "loader" },
//     { id: "shipped", label: "Shipped", icon: "truck" },
//     { id: "delivered", label: "Delivered", icon: "check-circle" },
//   ];

//   const filteredOrders = orders.filter((order) =>
//     selectedFilter === "all" ? true : order.status === selectedFilter,
//   );

//   const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

//   const getFilterIcon = (iconName: string, isActive: boolean) => {
//     return (
//       <Feather
//         name={iconName as any}
//         size={18}
//         color={isActive ? "#FFF" : "#666"}
//       />
//     );
//   };

// Main Component
const History: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [farmerId, setFarmerId] = useState<number | null>(null);
  const tabBarHeight = useBottomTabBarHeight();

  // Determine order status based on date
  const determineOrderStatus = (orderDate: string): Order["status"] => {
    const date = new Date(orderDate);
    const now = new Date();
    const daysDiff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysDiff < 2) return "processing";
    if (daysDiff < 5) return "shipped";
    return "delivered";
  };

  // Fetch farmer ID on mount
  useEffect(() => {
    const fetchFarmerId = async () => {
      const userData = await getUserData();
      if (userData?.userId) {
        setFarmerId(userData.userId);
      }
    };
    fetchFarmerId();
  }, []);

  // Fetch orders when farmerId is available
  useEffect(() => {
    if (farmerId) {
      fetchOrders();
    }
  }, [farmerId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/api/farmer/${farmerId}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData: ApiResponse = await response.json();
      console.log("Orders fetched:", responseData);

      if (responseData.statusCode === 200 && responseData.data) {
        // Transform API data to our Order type with calculated totals
        const transformedOrders: Order[] = responseData.data.map((apiOrder) => {
          // Calculate total from items to ensure accuracy
          const calculatedTotal = apiOrder.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );

          return {
            id: apiOrder.id.toString(),
            date: apiOrder.date,
            totalAmount: calculatedTotal, // Use calculated total instead of API total
            deliveryAddress: apiOrder.deliveryAddress,
            items: apiOrder.items.map((item) => ({
              ...item,
              shopName: apiOrder.shopName,
            })),
            status: determineOrderStatus(apiOrder.date),
          };
        });

        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
  };

  const filters = [
    { id: "all", label: "All Orders", icon: "clock" },
    { id: "processing", label: "Processing", icon: "loader" },
    { id: "shipped", label: "Shipped", icon: "truck" },
    { id: "delivered", label: "Delivered", icon: "check-circle" },
  ];

  const filteredOrders = orders.filter((order) =>
    selectedFilter === "all" ? true : order.status === selectedFilter,
  );

  // Calculate total spent from all orders using the calculated totals
  const totalSpent = filteredOrders.reduce((sum, order) => {
    // Ensure we're working with numbers
    const amount = Number(order.totalAmount) || 0;
    return sum + amount;
  }, 0);

  const getFilterIcon = (iconName: string, isActive: boolean) => {
    return (
      <Feather
        name={iconName as any}
        size={18}
        color={isActive ? "#FFF" : "#666"}
      />
    );
  };

  // Rest of your component remains the same...

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
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
            </BlurView>

            {/* Orders List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.loadingText}>Loading your orders...</Text>
              </View>
            ) : filteredOrders.length > 0 ? (
              <FlatList
                data={filteredOrders}
                renderItem={({ item }) => <OrderCard order={item} />}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                  styles.ordersList,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
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
  summaryValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  totalWarning: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  totalWarningText: {
    color: "#F57C00",
    fontSize: 12,
    textAlign: "center",
  },
});

export default History;

//order complete code
