import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Share,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

type GuideDetailParams = {
  guide: {
    id: number;
    title: string;
    description: string;
    image: string;
    readTime: string;
    difficulty: "Easy" | "Medium" | "Advanced";
    fullContent?: {
      introduction: string;
      sections: {
        title: string;
        content: string;
        tips?: string[];
      }[];
      conclusion: string;
      references?: string[];
    };
  };
};

const CropGuideDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { guide } = route.params as GuideDetailParams;

  // Mock full content for each guide
  const getFullContent = () => {
    const baseContent = {
      introduction: `This comprehensive guide will help you master the art of ${guide.title.toLowerCase()}. Whether you're a beginner or an experienced farmer, you'll find valuable insights to improve your crop yield and plant health.`,
      sections: [
        {
          title: "Getting Started",
          content: `Begin by preparing your soil with organic compost and ensuring proper drainage. The ideal time to start is during the early morning hours when temperatures are moderate. Make sure you have all necessary tools and materials ready before beginning.`,
          tips: [
            "Test soil pH before planting",
            "Use quality seeds from reputable sources",
            "Prepare irrigation system in advance",
          ],
        },
        {
          title: "Planting Process",
          content: `Plant seeds at the recommended depth, usually 2-3 times the seed's diameter. Space plants according to their mature size to prevent overcrowding. Water immediately after planting to settle the soil around the seeds.`,
          tips: [
            "Maintain proper spacing between plants",
            "Mark planting areas for organization",
            "Consider companion planting for better growth",
          ],
        },
        {
          title: "Ongoing Care",
          content: `Regular maintenance is key to healthy crop growth. Monitor soil moisture daily and adjust watering based on weather conditions. Apply organic fertilizers every 2-3 weeks during the growing season.`,
          tips: [
            "Water deeply but less frequently",
            "Mulch to retain moisture",
            "Remove weeds promptly",
          ],
        },
        {
          title: "Common Issues",
          content: `Watch for signs of pest infestation or disease. Yellowing leaves may indicate nutrient deficiency, while spots could signal fungal infections. Address problems early before they spread.`,
          tips: [
            "Inspect plants weekly",
            "Use organic pest control methods",
            "Remove affected plant parts immediately",
          ],
        },
      ],
      conclusion: `With proper care and attention, you'll be rewarded with a bountiful harvest. Remember that every growing season teaches you something new. Keep a garden journal to track your successes and learn from challenges.`,
      references: [
        "Agricultural Extension Service",
        "Organic Farming Association",
        "Plant Health Guidelines 2024",
      ],
    };

    // Customize based on guide title
    if (guide.title.includes("Tomato")) {
      return {
        ...baseContent,
        sections: [
          {
            title: "Tomato Varieties",
            content:
              "Choose from determinate (bush) or indeterminate (vine) varieties based on your space and needs. Popular choices include Roma, Cherry, and Beefsteak tomatoes.",
            tips: [
              "Heirloom varieties offer unique flavors",
              "Hybrids often have better disease resistance",
            ],
          },
          {
            title: "Support Systems",
            content:
              "Tomatoes need support as they grow. Use cages, stakes, or trellises to keep plants upright and fruits off the ground.",
            tips: [
              "Install supports at planting time",
              "Tie stems loosely to allow growth",
            ],
          },
          ...baseContent.sections,
        ],
      };
    }

    if (guide.title.includes("Pest")) {
      return {
        ...baseContent,
        sections: [
          {
            title: "Identifying Common Pests",
            content:
              "Learn to recognize aphids, caterpillars, beetles, and other common garden pests. Early identification is key to effective control.",
            tips: [
              "Use yellow sticky traps for monitoring",
              "Check underside of leaves regularly",
            ],
          },
          {
            title: "Natural Predators",
            content:
              "Encourage beneficial insects like ladybugs, lacewings, and praying mantis that feed on garden pests.",
            tips: [
              "Plant flowers to attract beneficials",
              "Avoid broad-spectrum pesticides",
            ],
          },
          ...baseContent.sections,
        ],
      };
    }

    return baseContent;
  };

  const fullContent = getFullContent();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this guide: ${guide.title} - ${guide.description}`,
        title: guide.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSave = () => {
    // Implement save functionality
    alert("Guide saved to your collection!");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: guide.image }} style={styles.headerImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.imageOverlay}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.imageActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleShare}
              >
                <Feather name="share" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSave}
              >
                <Feather name="bookmark" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Guide Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{guide.title}</Text>
            <View
              style={[
                styles.difficultyBadge,
                {
                  backgroundColor:
                    guide.difficulty === "Easy"
                      ? "#4CAF50"
                      : guide.difficulty === "Medium"
                        ? "#FF9800"
                        : "#F44336",
                },
              ]}
            >
              <Text style={styles.difficultyText}>{guide.difficulty}</Text>
            </View>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={16} color="#70AB6D" />
              <Text style={styles.metaText}>{guide.readTime}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="leaf" size={16} color="#70AB6D" />
              <Text style={styles.metaText}>Beginner Friendly</Text>
            </View>
          </View>

          <Text style={styles.description}>{guide.description}</Text>
        </View>

        {/* Introduction */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={styles.section}
        >
          <BlurView intensity={80} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>📖 Introduction</Text>
            <Text style={styles.sectionText}>{fullContent.introduction}</Text>
          </BlurView>
        </Animated.View>

        {/* Main Content Sections */}
        {fullContent.sections.map((section, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(300 + index * 100).duration(600)}
            style={styles.section}
          >
            <BlurView intensity={80} tint="light" style={styles.sectionBlur}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionText}>{section.content}</Text>

              {section.tips && (
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>💡 Pro Tips:</Text>
                  {section.tips.map((tip, tipIndex) => (
                    <View key={tipIndex} style={styles.tipItem}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}
            </BlurView>
          </Animated.View>
        ))}

        {/* Conclusion */}
        <Animated.View
          entering={FadeInDown.delay(700).duration(600)}
          style={styles.section}
        >
          <BlurView intensity={80} tint="light" style={styles.sectionBlur}>
            <Text style={styles.sectionTitle}>🎯 Conclusion</Text>
            <Text style={styles.sectionText}>{fullContent.conclusion}</Text>
          </BlurView>
        </Animated.View>

        {/* References */}
        {fullContent.references && (
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            style={styles.section}
          >
            <BlurView intensity={80} tint="light" style={styles.sectionBlur}>
              <Text style={styles.sectionTitle}>📚 References</Text>
              {fullContent.references.map((ref, index) => (
                <Text key={index} style={styles.referenceText}>
                  • {ref}
                </Text>
              ))}
            </BlurView>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(900).duration(600)}
          style={styles.actionButtons}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.goBack()}
          >
            <LinearGradient
              colors={["#2E7D32", "#1B5E20"]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Back to Guides</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleShare}
          >
            <Feather name="share-2" size={20} color="#2E7D32" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F9F5",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    height: 300,
    width: "100%",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    padding: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginTop: -30,
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
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 10,
  },
  difficultyText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  metaContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 15,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 20,
    overflow: "hidden",
  },
  sectionBlur: {
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 10,
  },
  tipsContainer: {
    backgroundColor: "rgba(112, 171, 109, 0.1)",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: "#2E7D32",
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
  },
  referenceText: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 15,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2E7D32",
    backgroundColor: "#FFF",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  bottomPadding: {
    height: 30,
  },
});

export default CropGuideDetail;
