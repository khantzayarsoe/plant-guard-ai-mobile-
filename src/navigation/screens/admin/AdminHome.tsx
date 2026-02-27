// AdminHome.tsx (Complete rewrite with all fixes)
import React, { useState } from "react";
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
  TextInput,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { width } = Dimensions.get("window");

// API Base URL
import { BASE_URL } from "../../../types/api";

// Types
interface Product {
  id: string;
  pesticideName: string;
  price: number;
  info: string;
  weight: string;
  ingredients: string;
  image: string;
  createdAt: Date;
}

interface Advertisement {
  id: string;
  image: string;
  createdAt: Date;
}

interface Stats {
  totalProducts: number;
  totalAds: number;
  totalUsers: number;
  totalRevenue: number;
}

// Add Product Modal
const AddProductModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, "id" | "createdAt">) => void;
  adminId: number;
}> = ({ visible, onClose, onSubmit, adminId }) => {
  const [pesticideName, setPesticideName] = useState("");
  const [price, setPrice] = useState("");
  const [info, setInfo] = useState("");
  const [weight, setWeight] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (
      !pesticideName.trim() ||
      !price.trim() ||
      !info.trim() ||
      !weight.trim() ||
      !ingredients.trim() ||
      !image
    ) {
      Alert.alert("Error", "Please fill in all fields and select an image");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();

      const pesticideData = {
        name: pesticideName,
        price: priceNum.toString(),
        info: info,
        weight: weight,
        ingredients: ingredients,
      };

      // Append text fields
      formData.append("name", pesticideName);
      formData.append("price", priceNum.toString());
      formData.append("info", info);
      formData.append("weight", weight);
      formData.append("ingredients", ingredients);

      // Append image file
      if (image) {
        const filename = image.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("file", {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      const response = await fetch(`${BASE_URL}/api/admin/pesticides`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add product");
      }

      onSubmit({
        pesticideName,
        price: priceNum,
        info,
        weight,
        ingredients,
        image: responseData.imageUrl || image,
      });

      // Reset form
      setPesticideName("");
      setPrice("");
      setInfo("");
      setWeight("");
      setIngredients("");
      setImage(null);
      onClose();

      Alert.alert("Success", "Product added successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add product",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

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
              <Text style={styles.modalTitle}>Add New Pesticide</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Fill in the pesticide details below
            </Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            {/* Product Image */}
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.pickedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="camera" size={32} color="#1B5E20" />
                  <Text style={styles.imagePlaceholderText}>
                    Tap to add pesticide image
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Pesticide Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pesticide Name</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="package"
                  size={20}
                  color="#1B5E20"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., HIS-12"
                  value={pesticideName}
                  onChangeText={setPesticideName}
                  placeholderTextColor="#999"
                  editable={!isUploading}
                />
              </View>
            </View>

            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price ($)</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="dollar-sign"
                  size={20}
                  color="#1B5E20"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="1231.123"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                  editable={!isUploading}
                />
              </View>
            </View>

            {/* Info/Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Info</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Feather
                  name="file-text"
                  size={20}
                  color="#1B5E20"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Product information..."
                  value={info}
                  onChangeText={setInfo}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#999"
                  editable={!isUploading}
                />
              </View>
            </View>

            {/* Weight */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="anchor"
                  size={20}
                  color="#1B5E20"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12312 Gram"
                  value={weight}
                  onChangeText={setWeight}
                  placeholderTextColor="#999"
                  editable={!isUploading}
                />
              </View>
            </View>

            {/* Ingredients */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ingredients</Text>
              <View style={styles.inputContainer}>
                <Feather
                  name="droplet"
                  size={20}
                  color="#1B5E20"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., H-12"
                  value={ingredients}
                  onChangeText={setIngredients}
                  placeholderTextColor="#999"
                  editable={!isUploading}
                />
              </View>
            </View>

            {/* Upload Progress Indicator */}
            {isUploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#1B5E20" />
                <Text style={styles.uploadingText}>Adding product...</Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isUploading}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  isUploading && styles.disabledText,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                isUploading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isUploading}
            >
              <LinearGradient
                colors={
                  isUploading ? ["#CCCCCC", "#AAAAAA"] : ["#1B5E20", "#2E7D32"]
                }
                style={styles.submitGradient}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Add Pesticide</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Add Advertisement Modal (FIXED)
const AddAdModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (ad: Omit<Advertisement, "id" | "createdAt">) => void;
  adminId: number;
}> = ({ visible, onClose, onSubmit, adminId }) => {
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (images.length === 0) {
      Alert.alert(
        "Error",
        "Please select at least one image for the advertisement",
      );
      return;
    }

    try {
      setIsUploading(true);
      let successCount = 0;

      for (const imageUri of images) {
        const formData = new FormData();

        // Append adminId
        formData.append("adminId", adminId.toString());

        // IMPORTANT: Server expects field name 'images' (plural)
        const filename = imageUri.split("/").pop() || "image.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        formData.append("images", {
          uri: imageUri,
          name: filename,
          type,
        } as any);

        const response = await fetch(`${BASE_URL}/api/admin/ads`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          console.error("Failed to upload image:", responseData);
        } else {
          successCount++;
          onSubmit({
            image: responseData.imageUrl || imageUri,
          });
        }
      }

      if (successCount > 0) {
        Alert.alert(
          "Success",
          `${successCount} out of ${images.length} advertisement(s) added successfully!`,
        );

        setImages([]);
        onClose();
      } else {
        throw new Error("Failed to upload any advertisements");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to add advertisements",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false, // Must be false when multiple selection is enabled
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

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
              <Text style={styles.modalTitle}>Add New Advertisements</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Upload images for your advertisements
            </Text>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            {/* Ad Image Picker */}
            <TouchableOpacity
              style={styles.adImagePicker}
              onPress={pickImages}
              disabled={isUploading}
            >
              <View style={styles.adImagePlaceholder}>
                <Feather name="image" size={48} color="#1B5E20" />
                <Text style={styles.adImagePlaceholderText}>
                  Tap to select advertisement images
                </Text>
                <Text style={styles.adImageHint}>
                  You can select multiple images
                </Text>
              </View>
            </TouchableOpacity>

            {/* Selected Images Preview */}
            {images.length > 0 && (
              <View style={styles.selectedImagesContainer}>
                <Text style={styles.selectedImagesTitle}>
                  Selected Images ({images.length})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: image }}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                        disabled={isUploading}
                      >
                        <Feather name="x-circle" size={24} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Upload Progress Indicator */}
            {isUploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#1B5E20" />
                <Text style={styles.uploadingText}>
                  Uploading {images.length} advertisement(s)...
                </Text>
                <Text style={styles.uploadingSubText}>
                  Please do not close the app
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isUploading}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  isUploading && styles.disabledText,
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (images.length === 0 || isUploading) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={images.length === 0 || isUploading}
            >
              <LinearGradient
                colors={
                  images.length === 0 || isUploading
                    ? ["#CCCCCC", "#AAAAAA"]
                    : ["#1B5E20", "#2E7D32"]
                }
                style={styles.submitGradient}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Add {images.length > 0 ? `${images.length} ` : ""}
                    Advertisement{images.length !== 1 ? "s" : ""}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradientColors: [string, string];
  change?: string;
}> = ({ title, value, icon, gradientColors, change }) => (
  <LinearGradient
    colors={gradientColors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.statCard}
  >
    <View style={styles.statIconContainer}>
      <MaterialCommunityIcons name={icon} size={24} color="#FFF" />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    {change && (
      <View style={styles.statChange}>
        <Text style={styles.statChangeText}>{change}</Text>
      </View>
    )}
  </LinearGradient>
);

// Recent Activity Item
const ActivityItem: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  time: string;
  color: string;
}> = ({ icon, title, time, color }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color + "20" }]}>
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

// Main AdminHome Component
const AdminHome: React.FC = () => {
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [addAdModalVisible, setAddAdModalVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<Advertisement[]>([]);
  const tabBarHeight = useBottomTabBarHeight();

  const adminId = 1; // Replace with actual admin ID from your auth system

  const stats: Stats = {
    totalProducts: products.length,
    totalAds: ads.length,
    totalUsers: 100,
    totalRevenue: 10,
  };

  const handleAddProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setProducts([newProduct, ...products]);
  };

  const handleAddAd = (ad: Omit<Advertisement, "id" | "createdAt">) => {
    const newAd: Advertisement = {
      ...ad,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setAds([newAd, ...ads]);
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.adminName}>Admin</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>5</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileButton}>
              <BlurView intensity={80} tint="light" style={styles.profileBlur}>
                <Text style={styles.profileInitials}>AD</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.headerSubtitle}>
          Manage your platform efficiently
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + 20 },
        ]}
      >
        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setAddProductModalVisible(true)}
            >
              <LinearGradient
                colors={["#1B5E20", "#2E7D32"]}
                style={styles.quickActionGradient}
              >
                <Feather name="package" size={32} color="#FFF" />
                <Text style={styles.quickActionTitle}>Add Pesticide</Text>
                <Text style={styles.quickActionDescription}>
                  Add new pesticides to inventory
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => setAddAdModalVisible(true)}
            >
              <LinearGradient
                colors={["#1B5E20", "#2E7D32"]}
                style={styles.quickActionGradient}
              >
                <Feather name="image" size={32} color="#FFF" />
                <Text style={styles.quickActionTitle}>Add Advertisement</Text>
                <Text style={styles.quickActionDescription}>
                  Create new ad campaigns
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              icon="package-variant"
              gradientColors={["#6366F1", "#8B5CF6"]}
              change="+12%"
            />
            <StatCard
              title="Active Ads"
              value={stats.totalAds}
              icon="image-multiple"
              gradientColors={["#F59E0B", "#F97316"]}
              change="+5%"
            />
            {/* <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="account-group"
              gradientColors={["#10B981", "#34D399"]}
              change="+8%"
            />
            <StatCard
              title="Total Revenue"
              value={`$${stats.totalRevenue}`}
              icon="currency-usd"
              gradientColors={["#EF4444", "#F87171"]}
              change="+15%"
            /> */}
          </View>
        </View>

        {/* Recent Products */}
        {products.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Pesticides</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {products.slice(0, 3).map((product) => (
              <View key={product.id} style={styles.recentItem}>
                <View style={styles.recentItemIcon}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={24}
                    color="#6366F1"
                  />
                </View>
                <View style={styles.recentItemContent}>
                  <Text style={styles.recentItemTitle}>
                    {product.pesticideName}
                  </Text>
                  <Text style={styles.recentItemSubtitle}>
                    ${product.price} • {product.weight} • Added{" "}
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Ads */}
        {ads.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Advertisements</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {ads.slice(0, 3).map((ad) => (
              <View key={ad.id} style={styles.recentItem}>
                <View style={styles.recentItemIcon}>
                  <MaterialCommunityIcons
                    name="image"
                    size={24}
                    color="#F59E0B"
                  />
                </View>
                <View style={styles.recentItemContent}>
                  <Text style={styles.recentItemTitle}>Advertisement</Text>
                  <Text style={styles.recentItemSubtitle}>
                    Added {new Date(ad.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <ActivityItem
              icon="package-variant"
              title="New pesticide added"
              time="2 minutes ago"
              color="#6366F1"
            />
            <ActivityItem
              icon="image"
              title="Advertisement added"
              time="15 minutes ago"
              color="#F59E0B"
            />
            <ActivityItem
              icon="account"
              title="New user registered"
              time="1 hour ago"
              color="#10B981"
            />
            <ActivityItem
              icon="currency-usd"
              title="Payment received"
              time="2 hours ago"
              color="#EF4444"
            />
          </View>
        </View>
      </ScrollView>

      {/* Modals */}
      <AddProductModal
        visible={addProductModalVisible}
        onClose={() => setAddProductModalVisible(false)}
        onSubmit={handleAddProduct}
        adminId={adminId}
      />

      <AddAdModal
        visible={addAdModalVisible}
        onClose={() => setAddAdModalVisible(false)}
        onSubmit={handleAddAd}
        adminId={adminId}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "rgba(99, 102, 241, 0.1)",
  },
  patternCircle2: {
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },
  patternCircle3: {
    top: 300,
    left: -20,
    width: 100,
    height: 100,
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },
  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  greeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter-Regular",
  },
  adminName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter-Bold",
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter-Regular",
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
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4F46E5",
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  quickActionsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Inter-Bold",
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 15,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 160,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Inter-Bold",
    marginTop: 10,
    marginBottom: 5,
  },
  quickActionDescription: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Inter-Regular",
    textAlign: "center",
  },
  statsSection: {
    marginBottom: 25,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    fontFamily: "Inter-Bold",
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontFamily: "Inter-Regular",
  },
  statChange: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statChangeText: {
    color: "#FFF",
    fontSize: 10,
    fontFamily: "Inter-Medium",
  },
  recentSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  viewAllText: {
    color: "#6366F1",
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    fontFamily: "Inter-SemiBold",
    marginBottom: 4,
  },
  recentItemSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  activitySection: {
    marginBottom: 20,
  },
  activityList: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
    fontFamily: "Inter-Medium",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: "#9CA3AF",
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
    backgroundColor: "#FFF",
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
    marginBottom: 8,
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
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Inter-SemiBold",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
    fontFamily: "Inter-Regular",
  },
  textAreaContainer: {
    alignItems: "flex-start",
    minHeight: 100,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  imagePicker: {
    width: "100%",
    height: 150,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "Inter-Regular",
  },
  pickedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  adImagePicker: {
    width: "100%",
    height: 200,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  adImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 20,
  },
  adImagePlaceholderText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontFamily: "Inter-Medium",
    textAlign: "center",
  },
  adImageHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter-Regular",
  },
  selectedImagesContainer: {
    marginBottom: 20,
  },
  selectedImagesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    fontFamily: "Inter-SemiBold",
    marginBottom: 12,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 12,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 10,
  },
  uploadingText: {
    fontSize: 14,
    color: "#1B5E20",
    fontFamily: "Inter-Medium",
  },
  uploadingSubText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Inter-Regular",
    marginTop: 4,
  },
  disabledText: {
    opacity: 0.5,
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter-SemiBold",
  },
});

export default AdminHome;
