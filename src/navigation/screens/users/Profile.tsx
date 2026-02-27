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
  password: string;
  role: string;
  profileImage: string;
  isEmailVerified?: boolean | null;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

// type InfoFieldProps = {
//   icon: string;
//   label: string;
//   value: string;
//   field: keyof UserData;
//   isEditable?: boolean;
//   isPassword?: boolean;
//   isEditing: boolean;
//   userData: UserData;
//   setUserData: React.Dispatch<React.SetStateAction<UserData>>;
//   setShowChangePassword?: React.Dispatch<React.SetStateAction<boolean>>;
// };

type InfoFieldProps = {
  icon: string;
  label: string;
  value: string;
  field: keyof Omit<UserData, "isEmailVerified">; // Exclude isEmailVerified from editable fields
  isEditable?: boolean;
  isPassword?: boolean;
  isEditing: boolean;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setShowChangePassword?: React.Dispatch<React.SetStateAction<boolean>>;
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const insets = useSafeAreaInsets();

  // Get navigation with proper typing
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout: authLogout, user } = useAuth();

  // User data state - only fields that exist in API response
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    password: "••••••••",
    role: "Farmer",
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    isEmailVerified: null,
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      let farmerId = "2"; // Default fallback

      // Get farmer ID from auth context or storage
      if (user?.id) {
        farmerId = user.id;
      } else {
        const userData = await getUserData();
        if (userData?.userId) {
          farmerId = userData.userId.toString();
        }
      }

      console.log(`Fetching profile for farmer ID: ${farmerId}`);

      const response = await fetch(
        `${BASE_URL}/api/auth/farmer/${farmerId}/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Profile response:", responseData);

      if (responseData.statusCode === 200 && responseData.data) {
        setUserData((prev) => ({
          ...prev,
          fullName: responseData.data.fullName || prev.fullName,
          email: responseData.data.email || prev.email,
          isEmailVerified: responseData.data.isEmailVerified,
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Error", "Failed to load profile data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    if (isEditing) {
      // TODO: Implement update profile API call
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

    // TODO: Implement change password API call
    Alert.alert("Success", "Password changed successfully!");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowChangePassword(false);
  };

  const InfoField: React.FC<InfoFieldProps> = ({
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
  }) => {
    // Helper function to get string value for TextInput
    const getInputValue = (): string => {
      const val = userData[field];
      if (val === null || val === undefined) return "";
      return String(val);
    };

    // Handle text change - only for string fields
    const handleTextChange = (text: string) => {
      setUserData({ ...userData, [field]: text });
    };

    return (
      <View style={styles.infoField}>
        <View style={styles.fieldHeader}>
          <View style={styles.fieldIconContainer}>
            <Ionicons name={icon as any} size={22} color="#70AB6D" />
          </View>
          <Text style={styles.fieldLabel}>{label}</Text>
        </View>

        {isEditing && isEditable && !isPassword ? (
          <TextInput
            style={styles.fieldInput}
            value={getInputValue()}
            onChangeText={handleTextChange}
            placeholder={`Enter ${label.toLowerCase()}`}
            placeholderTextColor="#999"
          />
        ) : (
          <View style={styles.fieldValueContainer}>
            {isPassword ? (
              <View style={styles.passwordField}>
                <Text style={styles.fieldValue}>••••••••</Text>
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
              <Text
                style={[
                  styles.fieldValue,
                  field === "role" && styles.roleValue,
                ]}
              >
                {value || "Not provided"}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };
  // const InfoField: React.FC<InfoFieldProps> = ({
  //   icon,
  //   label,
  //   value,
  //   field,
  //   isEditable = false,
  //   isPassword = false,
  //   isEditing,
  //   userData,
  //   setUserData,
  //   setShowChangePassword,
  // }) => {
  //   // Helper function to get string value for TextInput
  //   const getInputValue = () => {
  //     const val = userData[field];
  //     if (val === null || val === undefined) return "";
  //     return String(val); // Convert to string
  //   };

  //   return (
  //     <View style={styles.infoField}>
  //       <View style={styles.fieldHeader}>
  //         <View style={styles.fieldIconContainer}>
  //           <Ionicons name={icon as any} size={22} color="#70AB6D" />
  //         </View>
  //         <Text style={styles.fieldLabel}>{label}</Text>
  //       </View>

  //       {isEditing && isEditable && !isPassword ? (
  //         <TextInput
  //           style={styles.fieldInput}
  //           value={getInputValue()} // FIXED: Always returns a string
  //           onChangeText={(text: string) =>
  //             setUserData({ ...userData, [field]: text })
  //           }
  //           placeholder={`Enter ${label.toLowerCase()}`}
  //           placeholderTextColor="#999"
  //         />
  //       ) : (
  //         <View style={styles.fieldValueContainer}>
  //           {isPassword ? (
  //             <View style={styles.passwordField}>
  //               <Text style={styles.fieldValue}>••••••••</Text>
  //               <TouchableOpacity
  //                 style={styles.eyeButton}
  //                 onPress={() =>
  //                   setShowChangePassword && setShowChangePassword(true)
  //                 }
  //               >
  //                 <Feather name="edit-2" size={18} color="#70AB6D" />
  //               </TouchableOpacity>
  //             </View>
  //           ) : (
  //             <Text
  //               style={[
  //                 styles.fieldValue,
  //                 field === "role" && styles.roleValue,
  //               ]}
  //             >
  //               {value || "Not provided"}
  //             </Text>
  //           )}
  //         </View>
  //       )}
  //     </View>
  //   );
  // };

  // test
  // const InfoField: React.FC<InfoFieldProps> = ({
  //   icon,
  //   label,
  //   value,
  //   field,
  //   isEditable = false,
  //   isPassword = false,
  //   isEditing,
  //   userData,
  //   setUserData,
  //   setShowChangePassword,
  // }) => (
  //   <View style={styles.infoField}>
  //     <View style={styles.fieldHeader}>
  //       <View style={styles.fieldIconContainer}>
  //         <Ionicons name={icon as any} size={22} color="#70AB6D" />
  //       </View>
  //       <Text style={styles.fieldLabel}>{label}</Text>
  //     </View>

  //     {isEditing && isEditable && !isPassword ? (
  //       <TextInput
  //         style={styles.fieldInput}
  //         value={userData[field] || ""} // FIXED: Handle null/undefined
  //         onChangeText={(text: string) =>
  //           setUserData({ ...userData, [field]: text })
  //         }
  //         placeholder={`Enter ${label.toLowerCase()}`}
  //         placeholderTextColor="#999"
  //       />
  //     ) : (
  //       <View style={styles.fieldValueContainer}>
  //         {isPassword ? (
  //           <View style={styles.passwordField}>
  //             <Text style={styles.fieldValue}>••••••••</Text>
  //             <TouchableOpacity
  //               style={styles.eyeButton}
  //               onPress={() =>
  //                 setShowChangePassword && setShowChangePassword(true)
  //               }
  //             >
  //               <Feather name="edit-2" size={18} color="#70AB6D" />
  //             </TouchableOpacity>
  //           </View>
  //         ) : (
  //           <Text
  //             style={[styles.fieldValue, field === "role" && styles.roleValue]}
  //           >
  //             {value || "Not provided"} {/* FIXED: Show fallback text */}
  //           </Text>
  //         )}
  //       </View>
  //     )}
  //   </View>
  // );

  const edges: Edge[] = ["right", "left"];

  if (isLoading) {
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
          <Text style={styles.headerTitle}>Farmer Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Manage your account information
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
              {userData.fullName || "Farmer"}
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

          <InfoField
            icon="person-outline"
            label="Full Name"
            value={userData.fullName}
            field="fullName"
            isEditable={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />

          <InfoField
            icon="mail-outline"
            label="Email"
            value={userData.email}
            field="email"
            isEditable={true}
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />

          <InfoField
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

          <InfoField
            icon="shield-checkmark-outline"
            label="Role"
            value={userData.role}
            field="role"
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />

          {/* Email Verification Status */}
          {userData.isEmailVerified !== undefined && (
            <View style={styles.verificationStatus}>
              <Ionicons
                name={
                  userData.isEmailVerified ? "checkmark-circle" : "alert-circle"
                }
                size={20}
                color={userData.isEmailVerified ? "#27AE60" : "#F39C12"}
              />
              <Text
                style={[
                  styles.verificationText,
                  userData.isEmailVerified && styles.verifiedText,
                ]}
              >
                {userData.isEmailVerified
                  ? "Email Verified"
                  : "Email Not Verified"}
              </Text>
            </View>
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

        {/* Account Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="account-circle" size={24} color="#70AB6D" />
            <Text style={styles.cardTitle}>Account Details</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>
              {userData.email || "Not provided"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account Type</Text>
            <Text style={styles.detailValue}>{userData.role}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email Verification</Text>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: userData.isEmailVerified
                      ? "#27AE60"
                      : "#F39C12",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color: userData.isEmailVerified ? "#27AE60" : "#F39C12",
                  },
                ]}
              >
                {userData.isEmailVerified ? "Verified" : "Not Verified"}
              </Text>
            </View>
          </View>
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
    </SafeAreaView>
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
  infoField: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  fieldValueContainer: {
    marginLeft: 52,
  },
  fieldValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  roleValue: {
    color: "#70AB6D",
    fontWeight: "700",
  },
  fieldInput: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#70AB6D",
    paddingVertical: 6,
    marginLeft: 52,
    paddingHorizontal: 0,
  },
  passwordField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyeButton: {
    padding: 4,
  },
  verificationStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 52,
    gap: 8,
  },
  verificationText: {
    fontSize: 14,
    color: "#F39C12",
  },
  verifiedText: {
    color: "#27AE60",
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
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    backgroundColor: "#F0F7F0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 90,
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
});

export default Profile;
