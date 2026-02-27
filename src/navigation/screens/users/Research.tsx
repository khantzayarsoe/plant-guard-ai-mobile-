import React, { useState } from "react";
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
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

// Define the navigation type
type RootStackParamList = {
  AuthHome: undefined;
  Home: undefined;
  Research: undefined;
  CropGuideDetail: { guide: CropGuide };
};

type CropTip = {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
};

type CropGuide = {
  id: number;
  title: string;
  description: string;
  image: string;
  readTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
};

const Research = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [savedGuides, setSavedGuides] = useState<number[]>([]);

  const categories = [
    "All",
    "Vegetables",
    "Fruits",
    "Grains",
    "Herbs",
    "Disease Control",
  ];

  const quickTips: CropTip[] = [
    {
      id: 1,
      title: "Optimal Watering",
      description:
        "Water deeply but less frequently to encourage deep root growth",
      icon: "💧",
      color: "#4A90E2",
      category: "Vegetables",
    },
    {
      id: 2,
      title: "Soil Health",
      description:
        "Test soil pH annually and add organic compost before planting",
      icon: "🌱",
      color: "#70AB6D",
      category: "All",
    },
    {
      id: 3,
      title: "Pest Control",
      description:
        "Introduce beneficial insects like ladybugs for natural pest control",
      icon: "🐞",
      color: "#F5A623",
      category: "Disease Control",
    },
    {
      id: 4,
      title: "Crop Rotation",
      description: "Rotate crops yearly to prevent soil depletion and disease",
      icon: "🔄",
      color: "#9B59B6",
      category: "Grains",
    },
  ];

  const cropGuides: CropGuide[] = [
    {
      id: 1,
      title: "Tomato Growing Guide",
      description:
        "Complete guide to growing healthy tomatoes from seed to harvest",
      image:
        "https://images.unsplash.com/photo-1592841200001-8d4a6a4b3b3a?w=500",
      readTime: "5 min read",
      difficulty: "Easy",
    },
    {
      id: 2,
      title: "Organic Pest Management",
      description: "Natural methods to protect your crops without chemicals",
      image:
        "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=500",
      readTime: "8 min read",
      difficulty: "Medium",
    },
    {
      id: 3,
      title: "Soil Preparation Techniques",
      description: "How to prepare and maintain healthy soil for maximum yield",
      image:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500",
      readTime: "6 min read",
      difficulty: "Easy",
    },
    {
      id: 4,
      title: "Disease Identification",
      description: "Spot common crop diseases early and take action",
      image:
        "https://images.unsplash.com/photo-1592982537447-6f2a6a0c8b9c?w=500",
      readTime: "10 min read",
      difficulty: "Advanced",
    },
    {
      id: 5,
      title: "Companion Planting",
      description:
        "Learn which plants grow better together for natural pest control",
      image:
        "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=500",
      readTime: "7 min read",
      difficulty: "Medium",
    },
    {
      id: 6,
      title: "Water Management",
      description: "Efficient irrigation techniques for water conservation",
      image:
        "https://images.unsplash.com/photo-1591261730790-0c0c3a6b7b9c?w=500",
      readTime: "4 min read",
      difficulty: "Easy",
    },
  ];

  const filteredGuides = cropGuides.filter((guide) => {
    const matchesSearch =
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      guide.title.includes(selectedCategory) ||
      guide.description.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleBackToHome = () => {
    navigation.navigate("UserTabBar" as never);
  };

  const handleReadGuide = (guide: CropGuide) => {
    navigation.navigate("CropGuideDetail", { guide });
  };

  const handleSaveGuide = (guideId: number) => {
    if (savedGuides.includes(guideId)) {
      setSavedGuides(savedGuides.filter((id) => id !== guideId));
    } else {
      setSavedGuides([...savedGuides, guideId]);
    }
  };

  const TipCard = ({ tip, index }: { tip: CropTip; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(600)}
      style={styles.tipCard}
    >
      <LinearGradient
        colors={[tip.color + "20", tip.color + "05"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tipGradient}
      >
        <View
          style={[
            styles.tipIconContainer,
            { backgroundColor: tip.color + "20" },
          ]}
        >
          <Text style={styles.tipIcon}>{tip.icon}</Text>
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDescription} numberOfLines={2}>
            {tip.description}
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const GuideCard = ({ guide, index }: { guide: CropGuide; index: number }) => {
    const isSaved = savedGuides.includes(guide.id);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 150).duration(600)}
        style={styles.guideCard}
      >
        <Image source={{ uri: guide.image }} style={styles.guideImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.guideOverlay}
        >
          <View style={styles.guideContent}>
            <View style={styles.guideHeader}>
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
              <View style={styles.readTimeContainer}>
                <Feather name="clock" size={12} color="#FFF" />
                <Text style={styles.readTimeText}>{guide.readTime}</Text>
              </View>
            </View>

            <Text style={styles.guideTitle}>{guide.title}</Text>
            <Text style={styles.guideDescription} numberOfLines={2}>
              {guide.description}
            </Text>

            <View style={styles.guideActions}>
              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => handleReadGuide(guide)}
              >
                <Text style={styles.readMoreText}>Read Guide</Text>
                <Feather name="arrow-right" size={16} color="#70AB6D" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSaveGuide(guide.id)}
              >
                <Feather
                  name={isSaved ? "bookmark" : "bookmark"}
                  size={18}
                  color={isSaved ? "#70AB6D" : "#FFF"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
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

      {/* Header */}
      <LinearGradient
        colors={["#1B5E20", "#2E7D32"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Crop Guide & Tips</Text>
            <Text style={styles.headerSubtitle}>
              Expert advice for healthy crops
            </Text>
          </View>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
          >
            <Ionicons name="home-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(800)}
          style={styles.searchContainer}
        >
          <BlurView intensity={80} tint="light" style={styles.searchBlur}>
            <Feather name="search" size={20} color="#70AB6D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search guides and tips..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Feather name="x" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </BlurView>
        </Animated.View>

        {/* Categories */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(800)}
          style={styles.categoriesContainer}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Quick Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚡ Quick Tips</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tipsScroll}
          >
            {quickTips.map((tip, index) => (
              <TipCard key={tip.id} tip={tip} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Featured Guide */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(800)}
          style={styles.featuredContainer}
        >
          <LinearGradient
            colors={["#2E7D32", "#1B5E20"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredBadge}>🌟 FEATURED</Text>
              <Text style={styles.featuredTitle}>
                Complete Guide to Organic Farming
              </Text>
              <Text style={styles.featuredDescription}>
                Learn sustainable farming practices that increase yield and
                protect the environment
              </Text>
              <TouchableOpacity
                style={styles.featuredButton}
                onPress={() => handleReadGuide(cropGuides[1])}
              >
                <Text style={styles.featuredButtonText}>Start Learning</Text>
                <Feather name="arrow-right" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.featuredIcon}>
              <Text style={styles.featuredEmoji}>🌿</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Crop Guides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📚 Crop Guides</Text>
            <Text style={styles.guideCount}>
              {filteredGuides.length} guides
            </Text>
          </View>

          {filteredGuides.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="book-open" size={50} color="#E0E0E0" />
              <Text style={styles.emptyText}>No guides found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your search or category
              </Text>
            </View>
          ) : (
            <View style={styles.guidesGrid}>
              {filteredGuides.map((guide, index) => (
                <GuideCard key={guide.id} guide={guide} index={index} />
              ))}
            </View>
          )}
        </View>

        {/* Seasonal Tips Card */}
        <Animated.View
          entering={FadeInUp.delay(500).duration(800)}
          style={styles.seasonalCard}
        >
          <BlurView intensity={80} tint="light" style={styles.seasonalBlur}>
            <View style={styles.seasonalContent}>
              <MaterialIcons name="wb-sunny" size={32} color="#FFA000" />
              <View style={styles.seasonalText}>
                <Text style={styles.seasonalTitle}>
                  Seasonal Planting Guide
                </Text>
                <Text style={styles.seasonalDescription}>
                  Discover what to plant this season for best results
                </Text>
              </View>
              <TouchableOpacity
                style={styles.seasonalButton}
                onPress={() => handleReadGuide(cropGuides[2])}
              >
                <Text style={styles.seasonalButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </Animated.View>

        {/* Bottom Padding */}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
    // borderRadius: 25,
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
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryChipActive: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#FFF",
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 14,
    color: "#70AB6D",
    fontWeight: "600",
  },
  guideCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tipsScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 15,
  },
  tipCard: {
    width: 260,
    borderRadius: 20,
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
  tipGradient: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  tipIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tipIcon: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  featuredContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  featuredCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#1B5E20",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  featuredContent: {
    flex: 1,
  },
  featuredBadge: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
    lineHeight: 26,
  },
  featuredDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 15,
    lineHeight: 18,
  },
  featuredButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredButtonText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
  },
  featuredIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredEmoji: {
    fontSize: 40,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    borderRadius: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  guidesGrid: {
    paddingHorizontal: 20,
    gap: 15,
  },
  guideCard: {
    height: 220,
    borderRadius: 20,
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
  guideImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  guideOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  guideContent: {
    gap: 8,
  },
  guideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "600",
  },
  readTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  readTimeText: {
    fontSize: 11,
    color: "#FFF",
    fontWeight: "500",
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  guideDescription: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },
  guideActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  readMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  readMoreText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  seasonalCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
  },
  seasonalBlur: {
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  seasonalContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  seasonalText: {
    flex: 1,
  },
  seasonalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  seasonalDescription: {
    fontSize: 12,
    color: "#666",
  },
  seasonalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 15,
  },
  seasonalButtonText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  bottomPadding: {
    height: 30,
  },
});

export default Research;
