import React, { useState } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  SafeAreaView,
  useSafeAreaInsets,
  Edge,
} from "react-native-safe-area-context";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";

// Define your navigation types
type RootStackParamList = {
  Auth: undefined;
  UserApp: undefined;
  MerchantApp: undefined;
  AdminApp: undefined;
  // Add other screens if needed
};

type UserData = {
  name: string;
  phone: string;
  password: string;
  role: string;
  profileImage: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type InfoFieldProps = {
  icon: string;
  label: string;
  value: string;
  key: keyof UserData;
  isPassword?: boolean;
  isEditing: boolean;
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  setShowChangePassword: React.Dispatch<React.SetStateAction<boolean>>;
};

const Profile = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showChangePassword, setShowChangePassword] = useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  // Get navigation with proper typing
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout: authLogout } = useAuth();

  // User data
  const [userData, setUserData] = useState<UserData>({
    name: "Admin",
    phone: "+959 985558455",
    password: "••••••••",
    role: "admin",
    profileImage: "https://randomuser.me/api/portraits/men/20.jpg",
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
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
          // Clear auth context
          authLogout();

          // Navigate back to Auth stack
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
    key,
    isPassword = false,
    isEditing,
    userData,
    setUserData,
    setShowChangePassword,
  }) => (
    <View style={styles.infoField}>
      <View style={styles.fieldHeader}>
        <View style={styles.fieldIconContainer}>
          <Ionicons name={icon as any} size={22} color="#70AB6D" />
        </View>
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>

      {isEditing && key !== "role" && !isPassword ? (
        <TextInput
          style={styles.fieldInput}
          value={userData[key]}
          onChangeText={(text: string) =>
            setUserData({ ...userData, [key]: text })
          }
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <View style={styles.fieldValueContainer}>
          {isPassword ? (
            <View style={styles.passwordField}>
              <Text style={styles.fieldValue}>••••••••</Text>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowChangePassword(true)}
              >
                <Feather name="edit-2" size={18} color="#70AB6D" />
              </TouchableOpacity>
            </View>
          ) : (
            <Text
              style={[styles.fieldValue, key === "role" && styles.roleValue]}
            >
              {value}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const edges: Edge[] = ["right", "left"];

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
          <Text style={styles.headerTitle}>My Profile</Text>
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
                <Feather name="camera" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileRole}>{userData.role}</Text>
          </View>

          <TouchableOpacity
            style={[styles.editButton, isEditing && styles.saveButton]}
            onPress={handleEditProfile}
          >
            <Feather
              name={isEditing ? "check" : "edit-3"}
              size={20}
              color="#FFF"
            />
            <Text style={styles.editButtonText}>
              {isEditing ? "Save" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-circle-outline" size={24} color="#70AB6D" />
            <Text style={styles.cardTitle}>Profile Information</Text>
          </View>

          <InfoField
            icon="person-outline"
            label="Full Name"
            value={userData.name}
            key="name"
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />

          <InfoField
            icon="call-outline"
            label="Phone Number"
            value={userData.phone}
            key="phone"
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />

          <InfoField
            icon="lock-closed-outline"
            label="Password"
            value={userData.password}
            key="password"
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
            key="role"
            isEditing={isEditing}
            userData={userData}
            setUserData={setUserData}
            setShowChangePassword={setShowChangePassword}
          />
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash-outline" size={24} color="#70AB6D" />
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowChangePassword(true)}
          >
            <View style={styles.actionIconContainer}>
              <Feather name="key" size={20} color="#70AB6D" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Change Password</Text>
              <Text style={styles.actionSubtitle}>
                Update your account password
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "#FFEAA7" },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#D35400"
              />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Notifications</Text>
              <Text style={styles.actionSubtitle}>
                Manage notification settings
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "#D5F4E6" },
              ]}
            >
              <Feather name="shield" size={20} color="#298124" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Privacy & Security</Text>
              <Text style={styles.actionSubtitle}>
                Control your privacy settings
              </Text>
            </View>
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
            <Text style={styles.detailLabel}>Account Created</Text>
            <Text style={styles.detailValue}>January 15, 2024</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Last Updated</Text>
            <Text style={styles.detailValue}>Today, 10:30 AM</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Account Status</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
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
    padding: 24,
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
  profileRole: {
    fontSize: 15,
    color: "#70AB6D",
    fontWeight: "600",
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
    marginBottom: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  infoField: {
    marginBottom: 24,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
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
    marginLeft: 48,
  },
  fieldValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
  },
  roleValue: {
    fontWeight: "600",
    color: "#298124",
  },
  fieldInput: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
    borderBottomWidth: 1,
    borderBottomColor: "#298124",
    paddingVertical: 6,
    marginLeft: 48,
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
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#888",
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
    backgroundColor: "#D5F4E6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#27AE60",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#27AE60",
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
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F9F9F9",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 14,
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
    borderRadius: 10,
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
    backgroundColor: "#298124",
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
