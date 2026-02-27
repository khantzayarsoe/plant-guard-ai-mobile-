import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/navigation";
import { icons } from "../../components/icons";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../../types/api";

const { width, height } = Dimensions.get("window");

const Scan = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: false,
    gallery: false,
  });
  const ScanIcon = icons.Scannervirus;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  // Animation values
  const scanLineY = useSharedValue(0);
  const scanLineOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const pulseValue = useSharedValue(1);

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const galleryPermission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      setPermissionStatus({
        camera: cameraPermission.granted,
        gallery: galleryPermission.granted,
      });
    })();
  }, []);

  // Start scanning animation when analyzing
  useEffect(() => {
    if (isAnalyzing) {
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(200, { duration: 1500, easing: Easing.linear }),
          withTiming(0, { duration: 1500, easing: Easing.linear }),
        ),
        -1,
        true,
      );
      scanLineOpacity.value = withTiming(1, { duration: 300 });

      // Pulse animation
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      scanLineOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isAnalyzing]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: scanLineOpacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleButtonPress = (action: () => Promise<void>) => {
    buttonScale.value = withSequence(withSpring(0.95), withSpring(1));
    action();
  };

  // const analyzeImage = async (uri: string) => {
  //   setIsAnalyzing(true);

  //   try {
  //     const filename = uri.split("/").pop() || "scan.jpg";
  //     const match = /\.(\w+)$/.exec(filename);
  //     const type = match ? `image/${match[1]}` : "image/jpeg";

  //     const formData = new FormData();
  //     formData.append("file", {
  //       uri: uri,
  //       name: filename,
  //       type: type,
  //     } as any);

  //     // Get auth token
  //     const token = await getAuthToken();

  //     // Prepare headers
  //     const headers: HeadersInit = {
  //       Accept: "application/json",
  //     };

  //     if (token) {
  //       headers["Authorization"] = `Bearer ${token}`;
  //     }

  //     const response = await fetch(`${BASE_URL}/api/ai/scan`, {
  //       method: "POST",
  //       body: formData,
  //       headers: headers,
  //     });

  //     if (!response.ok) {
  //       if (response.status === 401) {
  //         Alert.alert("Session Expired", "Please login again to continue.", [
  //           {
  //             text: "OK",
  //             onPress: () => navigation.navigate("Login" as never),
  //           },
  //         ]);
  //         return;
  //       }

  //       const errorData = await response.json();
  //       console.error("Server error:", errorData);
  //       throw new Error(`Server error: ${response.status}`);
  //     }

  //     const responseData = await response.json();
  //     console.log("Success:", responseData);

  //     // IMPORTANT: Extract the result from the correct path
  //     // Based on your log: responseData.data.result contains the analysis
  //     const analysisResult = responseData.data?.result;

  //     if (!analysisResult) {
  //       console.error("No analysis result in response:", responseData);
  //       Alert.alert("Error", "Invalid response from server");
  //       return;
  //     }

  //     // Store the analysis result
  //     await AsyncStorage.setItem(
  //       "lastAnalysisResult",
  //       JSON.stringify(analysisResult),
  //     );

  //     // Navigate to results page
  //     navigation.navigate("AnalysisResult", {
  //       imageUri: uri,
  //       analysisData: analysisResult,
  //     });
  //   } catch (error) {
  //     console.error("Analysis error:", error);
  //     Alert.alert("Error", "Failed to analyze image. Please try again.");
  //   } finally {
  //     setIsAnalyzing(false);
  //   }
  // };

  const analyzeImage = async (uri: string) => {
    setIsAnalyzing(true);

    try {
      const filename = uri.split("/").pop() || "scan.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri: uri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(`${BASE_URL}/api/ai/scan`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Success:", responseData);

      // Extract the result from the correct path
      const analysisResult = responseData.data?.result;

      if (!analysisResult) {
        console.error("No analysis result in response:", responseData);
        Alert.alert("Error", "Invalid response from server");
        return;
      }

      // Store the analysis result
      await AsyncStorage.setItem(
        "lastAnalysisResult",
        JSON.stringify(analysisResult),
      );

      // Navigate to results page
      navigation.navigate("AnalysisResult", {
        imageUri: uri,
        analysisData: analysisResult,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      Alert.alert("Error", "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // const analyzeImage = async (uri: string) => {
  //   setIsAnalyzing(true);

  //   try {
  //     // Create form data for image upload
  //     const formData = new FormData();
  //     formData.append("image", {
  //       uri: uri,
  //       type: "image/jpeg",
  //       name: "scan.jpg",
  //     } as any);

  //     // Make API call
  //     const response = await fetch(`${BASE_URL}/api/ai/scan`, {
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to analyze image");
  //     }

  //     const data = await response.json();

  //     // Store the analysis result in AsyncStorage or pass via navigation
  //     await AsyncStorage.setItem(
  //       "lastAnalysisResult",
  //       JSON.stringify(data.result),
  //     );

  //     // Navigate to results page with the image and analysis data
  //     navigation.navigate("AnalysisResult", {
  //       imageUri: uri,
  //       analysisData: data.result, // Pass the analysis data
  //     });
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to analyze image. Please try again.");
  //     console.error("Analysis error:", error);
  //   } finally {
  //     setIsAnalyzing(false);
  //   }
  // };

  const openCamera = async () => {
    if (!permissionStatus.camera) {
      Alert.alert(
        "Camera Permission Required",
        "Please enable camera access in settings to take photos.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => Camera.requestCameraPermissionsAsync(),
          },
        ],
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        await analyzeImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  };

  const openGallery = async () => {
    if (!permissionStatus.gallery) {
      Alert.alert(
        "Gallery Permission Required",
        "Please enable gallery access in settings to select photos.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Settings",
            onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync(),
          },
        ],
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setImage(imageUri);
        await analyzeImage(imageUri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  const resetScan = () => {
    setImage(null);
  };

  const returnHomePage = () => {
    navigation.navigate("UserTabBar" as never);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Decorative Background Elements */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.patternCircle1]} />
        <View style={[styles.patternCircle, styles.patternCircle2]} />
        <View style={[styles.patternCircle, styles.patternCircle3]} />
      </View>

      {/* Header */}
      <LinearGradient
        colors={["#1B5E20", "#2E7D32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Plant Guard AI Scanner</Text>
          <TouchableOpacity style={styles.returnHome} onPress={returnHomePage}>
            <Ionicons name="home-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          AI-Powered Plant Health Analysis
        </Text>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Scanner Container */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.scannerContainer}
        >
          <BlurView intensity={80} tint="light" style={styles.scannerBlur}>
            {!image && !isAnalyzing && (
              <View style={styles.placeholderContent}>
                <View style={styles.buttonIconContainer}>
                  <ScanIcon color="#2E7D32" size={66} />
                </View>
                <Text style={styles.placeholderTitle}>စကန်ဖတ်ရန်</Text>
                <Text style={styles.placeholderText}>
                  ဓာတ်ပုံရိုက်၍ယူပါ သို့မဟုတ် သင့်ဖုန်း ဓာတ်ပုံပြခန်းမှ
                  ရွေးချယ်ပါ
                </Text>
              </View>
            )}

            {image && (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: image }} style={styles.previewImage} />

                {/* Scanning Overlay */}
                {isAnalyzing && (
                  <View style={styles.scanningOverlay}>
                    <Animated.View style={[styles.scanLine, scanLineStyle]} />
                    <BlurView
                      intensity={50}
                      tint="dark"
                      style={styles.scanningInfo}
                    >
                      <Animated.View style={[styles.pulseCircle, pulseStyle]}>
                        <ActivityIndicator size="large" color="#4CAF50" />
                      </Animated.View>
                      <Text style={styles.scanningText}>
                        အပင်၏ ရောဂါကိုစကန်ဖတ်နေသည်...
                      </Text>
                      <Text style={styles.scanningSubtext}>
                        AI ဖြင့် ဓာတ်ပုံကို စစ်ဆေးနေစဉ်တွင် ဤစာမျက်နှာကို
                        မပိတ်ပါနှင့်
                      </Text>
                    </BlurView>
                  </View>
                )}

                {/* Image Actions */}
                {!isAnalyzing && (
                  <BlurView
                    intensity={80}
                    tint="dark"
                    style={styles.imageActions}
                  >
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={resetScan}
                    >
                      <Text style={styles.imageActionText}>×</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, styles.analyzeButton]}
                      onPress={() => analyzeImage(image)}
                    >
                      <Text style={styles.analyzeButtonText}>စစ်ဆေးပြီး</Text>
                    </TouchableOpacity>
                  </BlurView>
                )}
              </View>
            )}
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        {!image && !isAnalyzing && (
          <View style={styles.buttonsContainer}>
            <Animated.View
              entering={FadeInUp.delay(400).duration(800)}
              style={[styles.buttonWrapper, buttonAnimatedStyle]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleButtonPress(openCamera)}
              >
                <LinearGradient
                  colors={["#2196F3", "#1976D2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>ကင်မရာ ဖွင့်ပါ</Text>
                    <Text style={styles.buttonSubtitle}>
                      တိုက်ရိုက်ဓာတ်ပုံရိုက်၍ ယူပါ
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(500).duration(800)}
              style={[styles.buttonWrapper, buttonAnimatedStyle]}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleButtonPress(openGallery)}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>ဓာတ်ပုံ ရွေးချယ်ပါ</Text>
                    <Text style={styles.buttonSubtitle}>
                      သင့်ဖုန်းဓာတ်ပုံပြခန်းမှ ရယူပါ
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}

        {/* Quick Tips */}
        {!image && !isAnalyzing && (
          <Animated.View
            entering={FadeInUp.delay(600).duration(800)}
            style={styles.tipsContainer}
          >
            <BlurView intensity={100} tint="light" style={styles.tipsBlur}>
              <Text style={styles.tipsTitle}>💡အမြန် လမ်းညွှန်</Text>
              <View style={styles.tipItem}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>
                  အဖြေမှန်ကန်စွာ ဆုံးဖြတ်နိုင်ရန် အလင်းရောင် ကောင်းသောနေရာတွင်
                  ဓာတ်ပုံရိုက်ပါ
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>
                  ပိုး (သို့) မှို ကျ သောနေရာအား တိကျစွာ ပြပါ
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipDot}>•</Text>
                <Text style={styles.tipText}>ကင်မရာအား တည်ငြိမ်အောင်ထားပါ</Text>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </View>
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
    width: width,
    height: height,
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
    top: height * 0.3,
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
    alignItems: "flex-end",
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scannerContainer: {
    borderRadius: 25,
    backgroundColor: "#F0F8F0",
    overflow: "hidden",
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  scannerBlur: {
    minHeight: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 26,
    backgroundColor: "#F0F8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },
  placeholderContent: {
    alignItems: "center",
    padding: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  imageWrapper: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  scanningInfo: {
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    overflow: "hidden",
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  scanningText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  scanningSubtext: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  imageActions: {
    position: "absolute",
    top: 10,
    right: 10,
    left: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 15,
    padding: 8,
    overflow: "hidden",
  },
  imageActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageActionText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 28,
  },
  analyzeButton: {
    width: "auto",
    paddingHorizontal: 15,
    backgroundColor: "#4CAF50",
  },
  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  buttonWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  buttonIcon: {
    fontSize: 30,
    marginRight: 15,
    color: "#FFFFFF",
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  tipsContainer: {
    borderRadius: 20,
    overflow: "hidden",
  },
  tipsBlur: {
    backgroundColor: "#9ebe9c",
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipDot: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 8,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  returnHome: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Scan;
