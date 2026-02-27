import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import React, { useEffect } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/navigation";
import { LinearGradient } from "expo-linear-gradient"; // or 'react-native-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
const { width, height } = Dimensions.get("window");
import { BASE_URL } from "../../../types/api";

const AuthHome = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  console.log("Base URL:", BASE_URL);
  // Animation values
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const gradientOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animations
    titleOpacity.value = withDelay(
      300,
      withTiming(1, {
        duration: 1000,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    titleTranslateY.value = withDelay(
      300,
      withTiming(0, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }),
    );

    buttonScale.value = withDelay(
      800,
      withSpring(1, {
        damping: 12,
        stiffness: 100,
      }),
    );

    buttonOpacity.value = withDelay(
      800,
      withTiming(1, {
        duration: 600,
      }),
    );

    gradientOpacity.value = withDelay(
      200,
      withTiming(1, {
        duration: 1000,
      }),
    );
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ scale: buttonScale.value }],
    };
  });

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: gradientOpacity.value,
    };
  });

  const handleLoginPress = () => {
    // Add a small animation before navigation
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    // navigation.navigate("UserTabBar");
    // navigation.navigate("MerchantTabBar");
    navigation.navigate("AuthScreen");
  };

  return (
    <BlurView intensity={100} tint="light" style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ImageBackground
        source={require("../../../assets/images/crops.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Animated Gradient Overlay */}
        <Animated.View style={[styles.gradientOverlay, gradientAnimatedStyle]}>
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.1)",
              "rgba(0,50,0,0.3)",
              "rgba(0,100,0,0.5)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Top Decorative Elements */}
          <View style={styles.topDecor}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* App Icon/Logo */}
            <View style={styles.logoContainer}>
              <BlurView intensity={30} tint="light" style={styles.logoCircle}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                  style={styles.logoGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.logoText}>
                    🌱
                    {/* <Ionicons name="leaf" size={50} color="#2E7D32" /> */}
                  </Text>
                  {/* <Ionicons name="leaf" size={50} color="#FFF" />*/}
                </LinearGradient>
              </BlurView>
            </View>

            {/* Animated Title */}
            <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
              <Text style={styles.title}>Plant Guard</Text>
              <Text style={styles.titleHighlight}>AI</Text>
            </Animated.View>

            {/* Subtitle */}
            <Animated.View
              style={[styles.subtitleContainer, titleAnimatedStyle]}
            >
              <Text style={styles.subtitle}>
                AI နည်းပညာဖြင့် သင့်ဘဝကို ပြောင်းလဲလိုက်ပါ
              </Text>
            </Animated.View>

            {/* Features Pills */}
            <View style={styles.featuresContainer}>
              {["Smart Detection", "Real-time Alerts", "Health Analysis"].map(
                (feature, index) => (
                  <BlurView
                    intensity={30}
                    tint="light"
                    key={index}
                    style={styles.featurePill}
                  >
                    <LinearGradient
                      colors={[
                        "rgba(255,255,255,0.2)",
                        "rgba(255,255,255,0.05)",
                      ]}
                      style={styles.featurePillGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Text style={styles.featurePillText}>{feature}</Text>
                    </LinearGradient>
                  </BlurView>
                ),
              )}
            </View>
          </View>

          {/* Bottom Section with Button */}
          <View style={styles.bottomSection}>
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLoginPress}
                style={styles.button}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>စတင်ပါ</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Footer Text */}
            <Text style={styles.footerText}>AI-Powered Crop Protection</Text>
          </View>
        </View>
      </ImageBackground>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    // backgroundColor: "white",
  },
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 60,
    paddingBottom: 50,
  },
  topDecor: {
    position: "relative",
    height: 100,
  },
  decorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  decorCircle2: {
    position: "absolute",
    top: -20,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  title: {
    fontSize: 36,
    fontWeight: "300",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  titleHighlight: {
    fontSize: 42,
    fontWeight: "700",
    color: "#048a09",
    textShadowColor: "rgba(76, 175, 80, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginLeft: 5,
  },
  subtitleContainer: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  featurePill: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  featurePillGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  featurePillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  bottomSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    maxWidth: 300,
    borderRadius: 30,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  buttonArrow: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "300",
  },
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

export default AuthHome;
