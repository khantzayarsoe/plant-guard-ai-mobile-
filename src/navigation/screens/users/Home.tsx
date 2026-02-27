import React, { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/navigation";
import { BASE_URL } from "../../../types/api";
import { icons } from "../../components/icons";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { set } from "lodash";
// import { RefreshControl } from "react-native-gesture-handler";

const { width } = Dimensions.get("window");

// Demo image in case API fails
const FALLBACK_IMAGES = [
  {
    id: 1,
    imageUrl:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400",
  },
  {
    id: 2,
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400",
  },
  {
    id: 3,
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
  },
  {
    id: 4,
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400",
  },
  {
    id: 5,
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400",
  },
];

// API Response Types
interface AdImage {
  image: string;
}

interface AdsResponse {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    advertisements: AdImage[];
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

interface ImageItem {
  id: number;
  imageUrl: string;
}

const Home = () => {
  const [refrshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    freshData().then(() => {
      setRefreshing(false);
    });
  }, []);
  const freshData = async () => {
    const fetchImages = async () => {
      setLoading(true);
      setApiError(false);

      try {
        const url = `${BASE_URL}/api/ads`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AdsResponse = await response.json();

        if (data.statusCode === 200 && data.data?.advertisements) {
          const formattedImages = data.data.advertisements.map(
            (ad: AdImage, index: number) => {
              const imagePath = ad.image;
              const cleanPath = imagePath.startsWith("/")
                ? imagePath.substring(1)
                : imagePath;
              const fullUrl = `${BASE_URL}/uploads/${cleanPath}`;

              return {
                id: index + 1,
                imageUrl: fullUrl,
              };
            },
          );
          setImages(formattedImages);
        } else {
          setApiError(true);
          setImages(FALLBACK_IMAGES);
        }
      } catch (error) {
        setApiError(true);
        setImages(FALLBACK_IMAGES);
      } finally {
        setLoading(false);
      }
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        fetchImages();
        resolve(true);
      }, 2000);
    });
  };
  const [searchText, setSearchText] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const translateX = useSharedValue(0);
  const margin = 20;
  const containerWidth = width - margin * 2;
  const spacing = 20;
  const itemWidth = containerWidth + spacing;

  // Fetch images from backend
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setApiError(false);

      try {
        const url = `${BASE_URL}/api/ads`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: AdsResponse = await response.json();

        if (data.statusCode === 200 && data.data?.advertisements) {
          const formattedImages = data.data.advertisements.map(
            (ad: AdImage, index: number) => {
              const imagePath = ad.image;
              const cleanPath = imagePath.startsWith("/")
                ? imagePath.substring(1)
                : imagePath;
              const fullUrl = `${BASE_URL}/uploads/${cleanPath}`;

              return {
                id: index + 1,
                imageUrl: fullUrl,
              };
            },
          );
          setImages(formattedImages);
        } else {
          setApiError(true);
          setImages(FALLBACK_IMAGES);
        }
      } catch (error) {
        setApiError(true);
        setImages(FALLBACK_IMAGES);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Animation effect
  useEffect(() => {
    if (images.length === 0) return;

    let currentPos = 0;
    const totalItems = images.length;
    let isMounted = true;

    const animateSlide = () => {
      if (!isMounted) return;

      currentPos = (currentPos + 1) % totalItems;

      translateX.value = withTiming(
        -currentPos * itemWidth,
        { duration: 700 },
        (isFinished) => {
          if (isFinished && currentPos === totalItems - 1) {
            setTimeout(() => {
              if (isMounted) {
                currentPos = 0;
                translateX.value = 0;
              }
            }, 100);
          }
        },
      );
    };

    const intervalId = setInterval(animateSlide, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [images, itemWidth]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  // Navigation handlers
  const handleScanPress = () => {
    navigation.navigate("Scan" as never);
  };

  const handleOrderPress = () => {
    navigation.navigate("Shop" as never);
  };

  const handleResearchPress = () => {
    navigation.navigate("Research" as never);
  };

  const handleProfilePress = () => {
    navigation.navigate("Profile" as never);
  };

  // Icon components
  const ScanIcon = icons.Scannervirus;
  const OrderIcon = icons.Shop;
  const ResearchIcon = icons.History;

  // Render image with error handling
  const ImageWithFallback = ({
    item,
    index,
  }: {
    item: ImageItem;
    index: number;
  }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <View
        key={`${item.id}-${index}`}
        style={[
          styles.imageContainer,
          {
            width: containerWidth,
            marginRight: index === images.length ? 0 : spacing,
          },
        ]}
      >
        {imageError ? (
          <View style={styles.imageErrorContainer}>
            <Feather name="image" size={40} color="#CCC" />
            <Text style={styles.imageErrorText}>Failed to load</Text>
          </View>
        ) : (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>

      {/* Header - Profile Image Left, Search Bar Right */}
      <LinearGradient
        colors={["#1B5E20", "#2E7D32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          {/* Profile Image on Left */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfilePress}
          >
            <Image
              source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
              style={styles.profileImage}
            />
          </TouchableOpacity>

          {/* Search Bar on Right */}
          <View style={styles.headerSearchContainer}>
            <BlurView intensity={80} tint="light" style={styles.searchBlur}>
              <Feather name="search" size={20} color="#70AB6D" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
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
        </View>
      </LinearGradient>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refrshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sliding container */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={[styles.sliderWrapper, { marginHorizontal: margin }]}
        >
          {loading ? (
            <View
              style={[
                styles.imageContainer,
                {
                  width: containerWidth,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <ActivityIndicator size="large" color="#1B5E20" />
              <Text style={styles.loadingText}>Loading images...</Text>
            </View>
          ) : images.length > 0 ? (
            <Animated.View
              style={[styles.slidingContainer, animatedContainerStyle]}
            >
              {[...images, images[0]].map((item, index) => (
                <ImageWithFallback
                  key={`${item.id}-${index}`}
                  item={item}
                  index={index}
                />
              ))}
            </Animated.View>
          ) : (
            <View
              style={[
                styles.imageContainer,
                {
                  width: containerWidth,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Feather name="image" size={40} color="#CCC" />
              <Text style={styles.errorText}>No images available</Text>
            </View>
          )}
          {apiError && !loading && (
            <View style={styles.apiErrorBadge}>
              <Text style={styles.apiErrorText}>Using demo images</Text>
            </View>
          )}
        </Animated.View>

        {/* Action Buttons - Scan, Order, Research with Icons */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(800)}
          style={styles.actionButtonsContainer}
        >
          <Text style={styles.actionTitle}>How to maintain crops</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.scanButton]}
              onPress={handleScanPress}
              activeOpacity={0.7}
            >
              <View style={styles.buttonIconContainer}>
                <ScanIcon color="#2E7D32" size={26} />
              </View>
              <Text style={styles.buttonLabel}>စကန်ဖတ်ရန်</Text>
              <Text style={styles.buttonDescription}>
                ပိုးမွှားများ ကိုရှာဖွေပါ{" "}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.orderButton]}
              onPress={handleOrderPress}
              activeOpacity={0.7}
            >
              <View style={styles.buttonIconContainer}>
                <OrderIcon color="#2E7D32" size={24} />
              </View>
              <Text style={styles.buttonLabel}>ယခု ဝယ်မည်</Text>
              <Text style={styles.buttonDescription}>
                ပိုးသတ်ဆေးများနှင့်ဓာတ်မြေဩဇာ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.researchButton]}
              onPress={handleResearchPress}
              activeOpacity={0.7}
            >
              <View style={styles.buttonIconContainer}>
                <ResearchIcon color="#2E7D32" size={24} />
              </View>
              <Text style={styles.buttonLabel}>လေ့လာရန်</Text>
              <Text style={styles.buttonDescription}>
                လယ်ယာမြေစိုက်နည်းလမ်းများ
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Farming Tips Section */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.tipsContainer}
        >
          <Text style={styles.tipsSectionTitle}>
            လယ်ယာမြေစိုက်ပျိုးနည်းလမ်းများ
          </Text>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipEmoji}>🌱</Text>
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>မြေဆီလွှာ ကျန်းမာရေး</Text>
              <Text style={styles.tipDescription}>
                ကောင်းစွာကြီးထားရန် မြေဆီလွှာ၏ ရေဓာတ်ကို ပုံမှန်စစ်ဆေးပါ
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipEmoji}>💧</Text>
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>ရေသွင်း နည်းစနစ် </Text>
              <Text style={styles.tipDescription}>
                မနက်ခင်းရေလောင်းခြင်းဖြင့် အပင်များကို မှိုရောဂါများမှ ကာကွယ်ပါ
              </Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <Text style={styles.tipEmoji}>🐞</Text>
            </View>
            <View style={styles.tipTextContainer}>
              <Text style={styles.tipTitle}>Natural Pest Control</Text>
              <Text style={styles.tipDescription}>
                Introduce beneficial insects to your farm
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9F5",
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
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
    marginRight: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  headerSearchContainer: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  searchBlur: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sliderWrapper: {
    height: 160,
    overflow: "hidden",
    marginTop: 20,
    position: "relative",
  },
  slidingContainer: {
    flexDirection: "row",
    height: 160,
    alignItems: "center",
  },
  imageContainer: {
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#F0F0F0",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  imageErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  imageErrorText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 10,
  },
  apiErrorBadge: {
    position: "absolute",
    bottom: 5,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  apiErrorText: {
    fontSize: 10,
    color: "#FFF",
  },

  // Action Buttons Styles
  actionButtonsContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A2E",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F0F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A2E",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 11,
    color: "#6B8C6B",
    textAlign: "center",
  },
  scanButton: {
    backgroundColor: "#FFFFFF",
  },
  orderButton: {
    backgroundColor: "#FFFFFF",
  },
  researchButton: {
    backgroundColor: "#FFFFFF",
  },

  // Farming Tips Styles
  tipsContainer: {
    marginTop: 28,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3A2E",
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F7F0",
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F8F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E3A2E",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: "#6B8C6B",
    lineHeight: 18,
  },
});

export default Home;

// testing lang
