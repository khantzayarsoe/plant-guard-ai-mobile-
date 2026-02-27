// Profile.tsx (with shop creation API integration)
import React, { useState, useEffect } from "react";
import {
  Feather,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
  Edge,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../context/AuthContext";
import { fetchMerchantProfile } from "../../services/profileService";
import { getToken, getUserData } from "../../services/authService";
import { BASE_URL } from "../../../types/api";

// Define your navigation types
type RootStackParamList = {
  Auth: undefined;
  UserApp: undefined;
  MerchantApp: undefined;
  AdminApp: undefined;
};

// Updated UserData type to match API response
type UserData = {
  fullName: string;
  email: string;
  nrc: string;
  password: string;
  role: string;
  profileImage: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type Shop = {
  shopId?: number;
  name: string;
  address: string;
  description: string;
  createdAt?: string;
};

type NewShop = {
  shopName: string;
  shopAddress: string;
  description: string;
};

type InfoItemProps = {
  icon: string;
  label: string;
  value: string;
  field: keyof UserData;
  isEditable?: boolean;
  isPassword?: boolean;
  isEditing: boolean;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setShowChangePassword?: React.Dispatch<React.SetStateAction<boolean>>;
};

type ShopCardProps = {
  shop: Shop;
  index: number;
  isEditing: boolean;
  handleEditShop: (index: number) => void;
  handleDeleteShop: (index: number) => void;
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [showAddShopForm, setShowAddShopForm] = useState<boolean>(false);
  const [isEditingShop, setIsEditingShop] = useState<number | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isSubmittingShop, setIsSubmittingShop] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Get navigation with proper typing
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout: authLogout, user } = useAuth();

  // User data state - only fields that exist in API response
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    nrc: "",
    password: "••••••••",
    role: "Merchant",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Shops data - fetched from API
  const [shops, setShops] = useState<Shop[]>([]);

  // New shop form data
  const [newShop, setNewShop] = useState<NewShop>({
    shopName: "",
    shopAddress: "",
    description: "",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
    fetchMerchantShops();
  }, []);

  // Fetch merchant shops
  const fetchMerchantShops = async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.error("No token found!");
        return;
      }

      let merchantId = "2"; // Default fallback
      if (user?.id) {
        merchantId = user.id;
      } else {
        const userData = await getUserData();
        if (userData?.userId) {
          merchantId = userData.userId.toString();
        }
      }

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      // console.log(` ${response.status}  ID: ${merchantId} Name: ${name}`);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const responseData = await response.json();

      if (responseData.statusCode === 200 && responseData.data) {
        // Transform API response to match our Shop type
        const fetchedShops = responseData.data.map((shop: any) => ({
          shopId: shop.shopId,
          name: shop.shopName,
          address: shop.shopAddress,
          description: shop.description,
          createdAt: shop.createdAt,
        }));
        setShops(fetchedShops);
      }
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  // Create new shop
  const createShop = async () => {
    try {
      setIsSubmittingShop(true);
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please login again.");
        return;
      }

      let merchantId = "2"; // Default fallback
      if (user?.id) {
        merchantId = user.id;
      } else {
        const userData = await getUserData();
        if (userData?.userId) {
          merchantId = userData.userId.toString();
        }
      }

      // Prepare request body matching the required format
      const requestBody = {
        merchantId: parseInt(merchantId),
        shopName: newShop.shopName.trim(),
        shopAddress: newShop.shopAddress.trim(),
        description: newShop.description.trim() || "This is a shop", // Default description if empty
      };

      console.log("Creating shop with data:", requestBody);

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops`,
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
      console.log("Create shop response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || `HTTP error ${response.status}`,
        );
      }

      if (responseData.statusCode === 201 || responseData.statusCode === 200) {
        Alert.alert("Success", "Shop created successfully!");

        // Refresh shops list
        await fetchMerchantShops();

        // Reset form and close modal
        setNewShop({ shopName: "", shopAddress: "", description: "" });
        setShowAddShopForm(false);
        setIsEditingShop(null);
      } else {
        throw new Error(responseData.message || "Failed to create shop");
      }
    } catch (error) {
      console.error("Error creating shop:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to create shop. Please try again.",
      );
    } finally {
      setIsSubmittingShop(false);
    }
  };

  // Update shop
  const updateShop = async () => {
    try {
      setIsSubmittingShop(true);
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in. Please login again.");
        return;
      }

      let merchantId = "2"; // Default fallback
      if (user?.id) {
        merchantId = user.id;
      } else {
        const userData = await getUserData();
        if (userData?.userId) {
          merchantId = userData.userId.toString();
        }
      }

      const shopToUpdate = shops[isEditingShop!];

      // Prepare request body
      const requestBody = {
        merchantId: parseInt(merchantId),
        shopName: newShop.shopName.trim(),
        shopAddress: newShop.shopAddress.trim(),
        description: newShop.description.trim() || "This is a shop",
      };

      console.log("Updating shop with data:", requestBody);

      const response = await fetch(
        `${BASE_URL}/api/merchant/${merchantId}/shops/${shopToUpdate.shopId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        },
      );

      const responseData = await response.json();
      console.log("Update shop response:", responseData);

      if (!response.ok) {
        throw new Error(
          responseData.message || `HTTP error ${response.status}`,
        );
      }

      if (responseData.statusCode === 200) {
        Alert.alert("Success", "Shop updated successfully!");

        // Refresh shops list
        await fetchMerchantShops();

        // Reset form and close modal
        setNewShop({ shopName: "", shopAddress: "", description: "" });
        setShowAddShopForm(false);
        setIsEditingShop(null);
      } else {
        throw new Error(responseData.message || "Failed to update shop");
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update shop. Please try again.",
      );
    } finally {
      setIsSubmittingShop(false);
    }
  };

  // Delete shop
  const deleteShop = async (shopId: number | undefined) => {
    if (!shopId) return;

    Alert.alert(
      "Delete Shop",
      "Are you sure you want to delete this shop? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) {
                Alert.alert(
                  "Error",
                  "You are not logged in. Please login again.",
                );
                return;
              }

              let merchantId = "2"; // Default fallback
              if (user?.id) {
                merchantId = user.id;
              } else {
                const userData = await getUserData();
                if (userData?.userId) {
                  merchantId = userData.userId.toString();
                }
              }

              const response = await fetch(
                `${BASE_URL}/api/merchant/${merchantId}/shops/${shopId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                },
              );

              const responseData = await response.json();
              console.log("Delete shop response:", responseData);

              if (!response.ok) {
                throw new Error(
                  responseData.message || `HTTP error ${response.status}`,
                );
              }

              if (responseData.statusCode === 200) {
                Alert.alert("Success", "Shop deleted successfully!");

                // Refresh shops list
                await fetchMerchantShops();
              } else {
                throw new Error(
                  responseData.message || "Failed to delete shop",
                );
              }
            } catch (error) {
              console.error("Error deleting shop:", error);
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete shop. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const fetchProfileData = async () => {
    setIsLoadingProfile(true);
    try {
      console.log("Current user from auth context:", user);

      let merchantId = "2"; // Default fallback

      // First try to get from auth context
      if (user?.id) {
        merchantId = user.id;
        console.log("Using merchant ID from auth context:", merchantId);
      } else {
        // Try to get from AsyncStorage
        const userData = await getUserData();
        console.log("User data from storage:", userData);

        if (userData?.userId) {
          merchantId = userData.userId.toString();
          console.log("Using merchant ID from storage:", merchantId);
        } else {
          console.log("Using default merchant ID:", merchantId);
        }
      }

      // Get token for debugging
      const token = await getToken();
      console.log("Token exists:", !!token);
      console.log(
        "Token preview:",
        token ? `${token.substring(0, 30)}...` : "no token",
      );

      if (!token) {
        console.error("No token found! User might not be logged in.");
        Alert.alert("Error", "You are not logged in. Please login again.");
        return;
      }

      // Make the API call with the correct merchant ID
      const url = `${BASE_URL}/api/merchant/${merchantId}/me`;
      console.log("Fetching from URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response body:", errorText);

        if (response.status === 403) {
          // Check if token is expired
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(base64));
            console.log("Token payload:", payload);

            const exp = payload.exp;
            const now = Math.floor(Date.now() / 1000);
            console.log("Token exp:", exp, "Current time:", now);
            console.log("Token expired:", exp < now);

            if (exp < now) {
              Alert.alert(
                "Session Expired",
                "Your session has expired. Please login again.",
              );
              authLogout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Auth" }],
              });
              return;
            }
          } catch (e) {
            console.error("Error decoding token:", e);
          }
        }

        throw new Error(
          `HTTP error ${response.status}: ${response.statusText}`,
        );
      }

      const responseText = await response.text();
      console.log("Response text length:", responseText.length);

      if (!responseText) {
        throw new Error("Empty response from server");
      }

      const responseData = JSON.parse(responseText);
      console.log("Parsed response:", responseData);

      if (responseData.statusCode === 200 && responseData.data) {
        setUserData((prevData) => ({
          ...prevData,
          fullName: responseData.data.fullName || prevData.fullName,
          email: responseData.data.email || prevData.email,
          nrc: responseData.data.nrc || prevData.nrc,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes - you would make an API call here
      Alert.alert("Success", "Profile updated successfully!");
    }
    setIsEditing(!isEditing);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          console.log("Logged out");
          authLogout();
          navigation.reset({
            index: 0,
            routes: [{ name: "Auth" }],
          });
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    if (!passwordForm.currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }

    if (!passwordForm.newPassword) {
      Alert.alert("Error", "Please enter new password");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    // Here you would make an API call to change password
    Alert.alert("Success", "Password changed successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
  };

  const handleAddShop = () => {
    if (!newShop.shopName.trim()) {
      Alert.alert("Error", "Please enter shop name");
      return;
    }

    if (!newShop.shopAddress.trim()) {
      Alert.alert("Error", "Please enter shop address");
      return;
    }

    if (isEditingShop !== null) {
      // Update existing shop
      updateShop();
    } else {
      // Create new shop
      createShop();
    }
  };

  const handleEditShop = (index: number) => {
    const shop = shops[index];
    setNewShop({
      shopName: shop.name, //fix
      shopAddress: shop.address, //fix
      description: shop.description || "",
    });
    setIsEditingShop(index);
    setShowAddShopForm(true);
  };

  const handleDeleteShop = (index: number) => {
    const shop = shops[index];
    deleteShop(shop.shopId);
  };

  const InfoItem: React.FC<InfoItemProps> = ({
    icon,
    label,
    value,
    field,
    isEditable = false,
    isPassword = false,
    isEditing,
    userData,
    setUserData,
    setShowChangePassword,
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={22} color="#70AB6D" />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {isEditing && isEditable && !isPassword ? (
          <TextInput
            style={styles.infoInput}
            value={userData[field]}
            onChangeText={(text: string) =>
              setUserData({ ...userData, [field]: text })
            }
            placeholder={`Enter ${label}`}
          />
        ) : (
          <View style={styles.infoValueContainer}>
            {isPassword ? (
              <View style={styles.passwordField}>
                <Text style={styles.infoValue}>••••••••</Text>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() =>
                    setShowChangePassword && setShowChangePassword(true)
                  }
                >
                  <Feather name="edit-2" size={18} color="#70AB6D" />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.infoValue}>{value || "Not provided"}</Text>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const ShopCard: React.FC<ShopCardProps> = ({
    shop,
    index,
    isEditing,
    handleEditShop,
    handleDeleteShop,
  }) => (
    <View key={shop.shopId || index} style={styles.shopCard}>
      <View style={styles.shopHeader}>
        <View style={styles.shopIconContainer}>
          <FontAwesome5 name="store" size={20} color="#70AB6D" />
        </View>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.name}</Text>
          {shop.description ? (
            <Text style={styles.shopCategory}>{shop.description}</Text>
          ) : null}
        </View>
        {isEditing && (
          <View style={styles.shopActionsHeader}>
            <TouchableOpacity
              style={styles.shopMenuButton}
              onPress={() => handleEditShop(index)}
            >
              <Feather name="edit-2" size={18} color="#70AB6D" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shopMenuButton}
              onPress={() => handleDeleteShop(index)}
            >
              <Feather name="trash-2" size={18} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.shopAddressContainer}>
        <MaterialIcons name="location-on" size={16} color="#888" />
        <Text style={styles.shopAddress}>{shop.address}</Text>
      </View>
      <View style={styles.shopActions}>
        <TouchableOpacity style={styles.shopActionButton}>
          <Feather name="phone" size={16} color="#70AB6D" />
          <Text style={styles.shopActionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shopActionButton}>
          <MaterialIcons name="directions" size={16} color="#70AB6D" />
          <Text style={styles.shopActionText}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shopActionButton}>
          <Feather name="eye" size={16} color="#70AB6D" />
          <Text style={styles.shopActionText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const edges: Edge[] = ["right", "left"];

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#70AB6D" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top }]}
      edges={edges}
    >
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
          <Text style={styles.headerTitle}>Merchant Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your business and shops
        </Text>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileImage}
            />
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <Feather name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData.fullName || "Merchant"}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData.role}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.saveButton]}
            onPress={handleEditProfile}
          >
            <Feather
              name={isEditing ? "check" : "edit-3"}
              size={22}
              color="#FFF"
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#70AB6D" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <InfoItem
            icon="person-outline"
            label="Full Name"
            value={userData.fullName}
            field="fullName"
            isEditable={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
          />

          <InfoItem
            icon="mail-outline"
            label="Email"
            value={userData.email}
            field="email"
            isEditable={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
          />

          <InfoItem
            icon="id-card-outline"
            label="NRC Number"
            value={userData.nrc}
            field="nrc"
            isEditable={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
          />

          <InfoItem
            icon="lock-closed-outline"
            label="Password"
            value={userData.password}
            field="password"
            isPassword={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />
        </View>

        {/* Shops Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="store" size={20} color="#70AB6D" />
            <Text style={styles.cardTitle}>My Shops</Text>
            <Text style={styles.shopCount}>
              {shops.length} shop{shops.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {shops.length === 0 ? (
            <View style={styles.emptyShopsContainer}>
              <Feather name="shopping-cart" size={50} color="#E0E0E0" />
              <Text style={styles.emptyShopsText}>No shops added yet</Text>
              <Text style={styles.emptyShopsSubText}>
                {isEditing
                  ? "Click the button below to add your first shop"
                  : "Enable edit mode to add shops"}
              </Text>
            </View>
          ) : (
            <>
              {shops.map((shop, index) => (
                <ShopCard
                  key={shop.shopId || index}
                  shop={shop}
                  index={index}
                  isEditing={isEditing}
                  handleEditShop={handleEditShop}
                  handleDeleteShop={handleDeleteShop}
                />
              ))}
            </>
          )}

          {/* Add New Shop Button - Only show in edit mode */}
          {isEditing && (
            <TouchableOpacity
              style={styles.addShopButton}
              onPress={() => {
                setNewShop({ shopName: "", shopAddress: "", description: "" });
                setIsEditingShop(null);
                setShowAddShopForm(true);
              }}
            >
              <Feather name="plus-circle" size={20} color="#70AB6D" />
              <Text style={styles.addShopText}>
                {shops.length === 0 ? "Create New Shop" : "Add New Shop"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Account Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="settings-outline" size={24} color="#70AB6D" />
            <Text style={styles.cardTitle}>Account Settings</Text>
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowChangePassword(true)}
          >
            <View style={styles.settingIcon}>
              <Feather name="key" size={22} color="#70AB6D" />
            </View>
            <Text style={styles.settingText}>Change Password</Text>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#70AB6D"
              />
            </View>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#70AB6D"
              />
            </View>
            <Text style={styles.settingText}>Notifications</Text>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Feather name="help-circle" size={22} color="#70AB6D" />
            </View>
            <Text style={styles.settingText}>Help & Support</Text>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Bottom padding for TabBar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowChangePassword(false);
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Current Password *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChangeText={(text: string) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: text,
                      })
                    }
                    secureTextEntry={!isPasswordVisible}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    <Feather
                      name={isPasswordVisible ? "eye-off" : "eye"}
                      size={20}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>New Password *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChangeText={(text: string) =>
                      setPasswordForm({ ...passwordForm, newPassword: text })
                    }
                    secureTextEntry={!isPasswordVisible}
                  />
                </View>
                {passwordForm.newPassword &&
                  passwordForm.newPassword.length < 6 && (
                    <Text style={styles.errorText}>
                      Password must be at least 6 characters
                    </Text>
                  )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Confirm New Password *</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChangeText={(text: string) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: text,
                      })
                    }
                    secureTextEntry={!isPasswordVisible}
                  />
                </View>
                {passwordForm.confirmPassword &&
                  passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <Text style={styles.errorText}>Passwords do not match</Text>
                  )}
              </View>

              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>
                  Password Requirements:
                </Text>
                <View style={styles.requirementItem}>
                  <Feather name="check" size={16} color="#27AE60" />
                  <Text style={styles.requirementText}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Feather name="check" size={16} color="#27AE60" />
                  <Text style={styles.requirementText}>
                    Use strong combination
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowChangePassword(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!passwordForm.currentPassword ||
                    !passwordForm.newPassword ||
                    !passwordForm.confirmPassword ||
                    passwordForm.newPassword.length < 6 ||
                    passwordForm.newPassword !==
                      passwordForm.confirmPassword) &&
                    styles.disabledButton,
                ]}
                onPress={handleChangePassword}
                disabled={
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword ||
                  passwordForm.newPassword.length < 6 ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
              >
                <Text style={styles.submitButtonText}>Change Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Shop Modal */}
      <Modal
        visible={showAddShopForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddShopForm(false);
          setIsEditingShop(null);
          setNewShop({ shopName: "", shopAddress: "", description: "" });
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditingShop !== null
                  ? "Edit Shop"
                  : shops.length === 0
                    ? "Create First Shop"
                    : "Add New Shop"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAddShopForm(false);
                  setIsEditingShop(null);
                  setNewShop({
                    shopName: "",
                    shopAddress: "",
                    description: "",
                  });
                }}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Shop Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter shop name"
                  value={newShop.shopName}
                  onChangeText={(text: string) =>
                    setNewShop({ ...newShop, shopName: text })
                  }
                />
                {!newShop.shopName.trim() && (
                  <Text style={styles.errorText}>Shop name is required</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Shop Address *</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter full shop address"
                  value={newShop.shopAddress}
                  onChangeText={(text: string) =>
                    setNewShop({ ...newShop, shopAddress: text })
                  }
                  multiline
                  numberOfLines={3}
                />
                {!newShop.shopAddress.trim() && (
                  <Text style={styles.errorText}>Shop address is required</Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Enter shop description"
                  value={newShop.description}
                  onChangeText={(text: string) =>
                    setNewShop({ ...newShop, description: text })
                  }
                  multiline
                  numberOfLines={2}
                />
              </View>

              {isSubmittingShop && (
                <View style={styles.submittingContainer}>
                  <ActivityIndicator size="small" color="#70AB6D" />
                  <Text style={styles.submittingText}>
                    {isEditingShop !== null
                      ? "Updating shop..."
                      : "Creating shop..."}
                  </Text>
                </View>
              )}

              <View style={styles.formNote}>
                <Feather name="info" size={16} color="#70AB6D" />
                <Text style={styles.formNoteText}>
                  Fields marked with * are required
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddShopForm(false);
                  setIsEditingShop(null);
                  setNewShop({
                    shopName: "",
                    shopAddress: "",
                    description: "",
                  });
                }}
                disabled={isSubmittingShop}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    isSubmittingShop && styles.disabledText,
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!newShop.shopName.trim() ||
                    !newShop.shopAddress.trim() ||
                    isSubmittingShop) &&
                    styles.disabledButton,
                ]}
                onPress={handleAddShop}
                disabled={
                  !newShop.shopName.trim() ||
                  !newShop.shopAddress.trim() ||
                  isSubmittingShop
                }
              >
                {isSubmittingShop ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditingShop !== null ? "Update Shop" : "Save Shop"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Add these new styles to the existing styles object
const additionalStyles = {
  submittingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    marginTop: 10,
  },
  submittingText: {
    fontSize: 14,
    color: "#70AB6D",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
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
    top: 200,
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
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFF",
    marginBottom: 16,
    marginTop: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileImageContainer: {
    position: "relative",
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#E3F2FD",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#70AB6D",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  roleBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#70AB6D",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  saveButton: {
    backgroundColor: "#298124",
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  shopCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
    fontWeight: "500",
  },
  infoValueContainer: {
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  infoInput: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#70AB6D",
    paddingVertical: 4,
  },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyeButton: {
    padding: 4,
  },
  emptyShopsContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyShopsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 12,
    marginBottom: 4,
  },
  emptyShopsSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  shopCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8F0FE",
  },
  shopHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  shopIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  shopCategory: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  shopActionsHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  shopMenuButton: {
    padding: 8,
    marginLeft: 4,
  },
  shopAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  shopAddress: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  shopActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E8F0FE",
    paddingTop: 12,
  },
  shopActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F0F7FF",
  },
  shopActionText: {
    fontSize: 12,
    color: "#70AB6D",
    fontWeight: "500",
  },
  addShopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E8F0FE",
    borderStyle: "dashed",
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: "#F8FAFF",
  },
  addShopText: {
    fontSize: 16,
    color: "#70AB6D",
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
  },
  bottomPadding: {
    height: 90,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F9F9F9",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: "#FF6B6B",
    marginTop: 4,
    marginLeft: 4,
  },
  passwordRequirements: {
    backgroundColor: "#F0F7FF",
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#298124",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 13,
    color: "#666",
  },
  formNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    padding: 10,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
  },
  formNoteText: {
    fontSize: 12,
    color: "#70AB6D",
  },
  modalButtons: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#2E7D32",
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0B0B0",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F9F5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#70AB6D",
  },
  // Additional styles
  submittingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F0F7FF",
    borderRadius: 8,
    marginTop: 10,
  },
  submittingText: {
    fontSize: 14,
    color: "#70AB6D",
    fontWeight: "500",
  },
  disabledText: {
    opacity: 0.5,
  },
});

export default Profile;
