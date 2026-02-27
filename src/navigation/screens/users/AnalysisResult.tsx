import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../../../types/navigation";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { BASE_URL } from "../../../types/api";

const { width } = Dimensions.get("window");

// Use type assertion for FileSystem
const fs = FileSystem as any;

// Types for analysis data
interface Pesticide {
  pesticideId: number;
  pesticideName: string;
  imagePath: string;
}

interface AnalysisData {
  aiResult: {
    diseaseName: string;
    probability: string;
  };
  prevention: string;
  pesticides: Pesticide[] | null; // Allow pesticides to be null
}

interface AnalysisResultProps {
  route: {
    params: {
      imageUri: string;
      analysisData?: AnalysisData;
    };
  };
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ route }) => {
  const { imageUri, analysisData } = route.params;
  const scaleValue = useSharedValue(0.8);
  const opacityValue = useSharedValue(0);
  const [saving, setSaving] = useState(false);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    scaleValue.value = withSpring(1, { damping: 8, stiffness: 100 });
    opacityValue.value = withDelay(500, withTiming(1, { duration: 800 }));
  }, []);

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const confidenceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
  }));

  // If no analysis data, show fallback
  if (!analysisData) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#1B5E20", "#2E7D32", "#4CAF50"]}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>မှားယွင်းသည်</Text>
          <View style={styles.headerRight} />
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>စစ်ဆေး၍မရနိုင်ပါ</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.navigate("Scan" as never)}
          >
            <Text style={styles.errorButtonText}>စကန်သို့သွားပါ</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const saveReport = async () => {
    try {
      setSaving(true);

      // Check if sharing is available
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert("Info", "Sharing is not available on this device");
        return;
      }

      // Check if document directory is available
      if (!fs.documentDirectory) {
        Alert.alert("Error", "Unable to access device storage");
        return;
      }

      // Safely handle pesticides in report
      const pesticidesText =
        analysisData.pesticides && analysisData.pesticides.length > 0
          ? analysisData.pesticides
              .map((p) => `• ${p.pesticideName}`)
              .join("\n")
          : "• No specific pesticides recommended";

      // Create report text
      const reportText = `
Plant Guard AI Analysis Report
==============================
Date: ${new Date().toLocaleString()}
──────────────────────────────

DISEASE INFORMATION
──────────────────
Disease: ${analysisData.aiResult.diseaseName}
Confidence: ${(parseFloat(analysisData.aiResult.probability) * 100).toFixed(1)}%

PREVENTION METHODS
─────────────────
${analysisData.prevention || "No prevention information available"}

RECOMMENDED PESTICIDES
─────────────────────
${pesticidesText}

──────────────────────────────
Powered by Plant Guard AI
      `;

      // Save to file
      const fileName = `plant_guard_report_${Date.now()}.txt`;
      const filePath = fs.documentDirectory + fileName;

      await fs.writeAsStringAsync(filePath, reportText, {
        encoding: fs.EncodingType?.UTF8 || "utf8",
      });

      // Share the file
      await Sharing.shareAsync(filePath, {
        mimeType: "text/plain",
        dialogTitle: "Save Analysis Report",
        UTI: "public.text",
      });

      Alert.alert("Success", "Report saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save report");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get disease description
  // const getDiseaseDescription = (diseaseName: string): string => {
  //   const descriptions: { [key: string]: string } = {
  //     "Powdery Mildew":
  //       "A fungal disease that appears as white powdery spots on leaves and stems. It can cause stunted growth and reduced yield.",
  //     "Bacterial Leaf Blight":
  //       "A serious bacterial disease causing yellowing and wilting of leaves, starting from the tips and margins.",
  //     "Brown Spot":
  //       "A fungal disease appearing as small brown circular to oval spots on leaves, which may enlarge and reduce photosynthesis.",
  //     "Leaf Blast":
  //       "A destructive fungal disease producing diamond-shaped lesions with gray centers and brown margins on leaves.",
  //     "Leaf Scald":
  //       "A fungal disease causing irregular, water-soaked lesions that expand and turn straw-colored with brown borders.",
  //     "Sheath Blight":
  //       "A fungal disease affecting the leaf sheath, forming oval or irregular greenish-gray lesions.",
  //   };

  //   return (
  //     descriptions[diseaseName] ||
  //     `${diseaseName} detected in the plant sample. Please follow the recommended prevention and treatment methods.`
  //   );
  // };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      {/* Header with back button */}
      <LinearGradient
        colors={["#1B5E20", "#2E7D32", "#4CAF50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>စစ်ဆေးမှု ရလဒ်</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Preview */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          <Image source={{ uri: imageUri }} style={styles.resultImage} />
          <BlurView intensity={80} tint="dark" style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>စစ်ဆေးပြီး</Text>
          </BlurView>
        </Animated.View>

        {/* Disease Name & Confidence */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(800)}
          style={styles.diseaseContainer}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F5F5F5"]}
            style={styles.diseaseCard}
          >
            <Text style={styles.diseaseLabel}>မှတ်တမ်းရှိသည့် လက္ခဏာ</Text>
            <Text style={styles.diseaseName}>
              {analysisData.aiResult.diseaseName}
            </Text>

            <Animated.View
              style={[styles.confidenceContainer, confidenceAnimatedStyle]}
            >
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${parseFloat(analysisData.aiResult.probability)}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {parseFloat(analysisData.aiResult.probability).toFixed(1)}%
                Confidence
              </Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* Description */}
        {/* <Animated.View
          entering={FadeInDown.delay(400).duration(800)}
          style={styles.section}
        >
          <BlurView intensity={50} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>📋ဖော်ပြချက် </Text>
            <Text style={styles.sectionText}>
              {getDiseaseDescription(analysisData.aiResult.diseaseName)}
            </Text>
          </BlurView>
        </Animated.View> */}

        {/* Prevention */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(800)}
          style={styles.section}
        >
          <BlurView intensity={50} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>🛡️ ကာကွယ်ရန်</Text>
            <Text style={styles.sectionText}>{analysisData.prevention}</Text>
          </BlurView>
        </Animated.View>

        {/* Recommended Pesticides - FIXED with null check */}
        {/* <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.section}
        >
          <BlurView intensity={50} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>💊 အသုံးပြုရမည့် ပိုးသတ်ဆေး</Text>
            {analysisData.pesticides && analysisData.pesticides.length > 0 ? (
              analysisData.pesticides.map((pesticide) => (
                <View key={pesticide.pesticideId} style={styles.pesticideItem}>
                  <View style={styles.pesticideIcon}>
                    <Text style={styles.pesticideIconText}>🌿</Text>
                  </View>
                  <View style={styles.pesticideInfo}>
                    <Text style={styles.pesticideName}>
                      {pesticide.pesticideName}
                    </Text>
                    <Text style={styles.pesticideId}>
                      ID: {pesticide.pesticideId}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noPesticidesText}>
                ဤအခြေအနေအထားအတွက် အထူးပိုးသတ်ဆေး မရှိပါ။
              </Text>
            )}
          </BlurView>
        </Animated.View> */}

        <Animated.View
          entering={FadeInDown.delay(600).duration(800)}
          style={styles.section}
        >
          <BlurView intensity={50} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>💊 အသုံးပြုရမည့် ပိုးသတ်ဆေး</Text>
            {analysisData.pesticides && analysisData.pesticides.length > 0 ? (
              analysisData.pesticides.map((pesticide) => (
                <View key={pesticide.pesticideId} style={styles.pesticideItem}>
                  <View style={styles.pesticideIcon}>
                    <Image
                      source={{
                        uri: `${BASE_URL}/uploads/${pesticide.imagePath}`,
                      }}
                      style={styles.pesticideImage}
                      resizeMode="cover"
                      // Add default image if the actual image fails to load
                      // defaultSource={require("../../../../assets/default-pesticide.png")}
                      onError={(error) =>
                        console.log("Image load error:", error)
                      }
                    />
                  </View>
                  <View style={styles.pesticideInfo}>
                    <Text style={styles.pesticideName}>
                      {pesticide.pesticideName}
                    </Text>
                    {/* <Text style={styles.pesticideId}>
                      ID: {pesticide.pesticideId}
                    </Text> */}
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.noPesticidesText}>
                ဤအခြေအနေအထားအတွက် အထူးပိုးသတ်ဆေး မရှိပါ။
              </Text>
            )}
          </BlurView>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(700).duration(800)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Scan" as never)}
          >
            <LinearGradient
              colors={["#4CAF50", "#2E7D32"]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>စကန်ထပ်မံဖတ်ရန်</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={saveReport}
            disabled={saving}
          >
            <LinearGradient
              colors={saving ? ["#999999", "#757575"] : ["#757575", "#616161"]}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonText}>
                {saving ? "သိမ်းဆည်းနေသည်..." : "သိမ်းဆည်းရန်"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
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
  resultImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imageBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    overflow: "hidden",
  },
  imageBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  diseaseContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  diseaseCard: {
    padding: 20,
    borderRadius: 20,
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
  diseaseLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 5,
  },
  diseaseName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 15,
  },
  confidenceContainer: {
    marginTop: 5,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    marginBottom: 8,
  },
  confidenceFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionBlur: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 14,
    color: "#333333",
    lineHeight: 20,
  },
  pesticideItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 12,
  },
  pesticideIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  pesticideIconText: {
    fontSize: 20,
  },
  pesticideInfo: {
    flex: 1,
  },
  pesticideName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 2,
  },
  pesticideId: {
    fontSize: 12,
    color: "#666666",
  },
  noPesticidesText: {
    fontSize: 14,
    color: "#666666",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 10,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    opacity: 0.8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666666",
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // pesticideIcon: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 20,
  //   backgroundColor: "#f0f0f0", // Light background while image loads
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginRight: 12,
  //   overflow: "hidden",
  //   borderWidth: 1,
  //   borderColor: "#e0e0e0",
  // },

  pesticideImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default AnalysisResult;
