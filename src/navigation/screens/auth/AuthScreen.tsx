// AuthScreen.tsx (updated with farmer registration)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
  ImageBackground,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import { RootStackParamList } from "../../../types/navigation";
import {
  login,
  registerFarmer,
  registerMerchant,
  generateOTP,
  validateOTP,
  resendVerificationCode,
  LoginRequest,
  RegisterFarmerRequest,
  RegisterMerchantRequest,
  ValidateOTPRequest,
  getToken,
  getUserData,
} from "../../services/authService";
import EmailVerificationModal from "./EmailVerificationModal";

const { width, height } = Dimensions.get("window");

type AuthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Auth"
>;

// Forgot Password Modal Component
const ForgotPasswordModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSubmit(email);
      setEmail("");
    }, 1500);
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
            colors={["#4CAF50", "#2E7D32"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <Text style={styles.modalTitle}>စကားဝှက် ပြောင်းလဲရန်</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <View style={styles.modalBody}>
            <View style={styles.modalIconContainer}>
              <Feather name="lock" size={50} color="#4CAF50" />
            </View>

            <Text style={styles.modalDescription}>
              လျှို့ဝှက်စာလုံးမေ့နေပါသလား? စိတ်မပူပါနဲ့!
              အီးမေးလ်လိပ်စာကိုထည့်သွင်းပြီး အတည်ပြုကုဒ်ကိုရယူပါ။{"\n"}
            </Text>

            <View style={styles.modalInputContainer}>
              <Feather
                name="mail"
                size={20}
                color="#4CAF50"
                style={styles.modalInputIcon}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="အီးမေးလ်လိပ်စာ"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={onClose}
              >
                <Text style={styles.modalCancelText}>ပယ်ဖျက်ပါ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#4CAF50", "#2E7D32"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSubmitGradient}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalSubmitText}>ကုဒ်ပို့ပါ</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AuthScreen = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();
  const { login: authLogin } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [accountType, setAccountType] = useState<"farmer" | "merchant">(
    "farmer",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // Farmer registration form state
  const [farmerRegisterForm, setFarmerRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  // Merchant registration form state
  const [merchantRegisterForm, setMerchantRegisterForm] = useState({
    fullName: "",
    email: "",
    nrc: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const loginRequest: LoginRequest = {
        email: loginForm.email,
        password: loginForm.password,
      };

      const response = await login(loginRequest);

      if (response.statusCode === 200 && response.data) {
        console.log("Login response data:", response.data);

        const { userId, email, role, token } = response.data;
        const userName = email.split("@")[0] || "User";

        const userData = {
          id: userId.toString(),
          email: email,
          role: role,
          name: userName,
          token: token,
        };

        authLogin(userData);

        Alert.alert(
          "Success",
          response.message || "အကောင့်ဝင်ခြင်းအောင်မြင်ပါသည်!",
        );

        if (role === "farmer" || role === "user") {
          navigation.replace("UserApp");
        } else if (role === "merchant") {
          navigation.replace("MerchantApp");
        } else if (role === "admin") {
          navigation.replace("AdminApp");
        }
      } else {
        Alert.alert("Error", response.message || "Login failed");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred during login. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFarmerRegister = async () => {
    if (
      !farmerRegisterForm.fullName ||
      !farmerRegisterForm.email ||
      !farmerRegisterForm.password
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(farmerRegisterForm.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (farmerRegisterForm.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register farmer
      const registerRequest: RegisterFarmerRequest = {
        fullName: farmerRegisterForm.fullName,
        email: farmerRegisterForm.email,
        password: farmerRegisterForm.password,
      };

      console.log("Registering farmer with:", registerRequest);
      const registerResponse = await registerFarmer(registerRequest);

      if (registerResponse.statusCode === 200) {
        console.log("Farmer registration successful:", registerResponse.data);

        // Step 2: Generate and send OTP to email
        const otpResponse = await generateOTP({
          email: farmerRegisterForm.email,
        });

        if (otpResponse.statusCode === 200) {
          console.log("OTP generated successfully");

          // Show verification modal
          setVerificationEmail(farmerRegisterForm.email);
          setShowVerificationModal(true);

          Alert.alert(
            "Verification Code Sent",
            "Please check your email for the verification code.",
          );
        } else {
          Alert.alert(
            "Error",
            otpResponse.message || "Failed to send verification code",
          );
        }
      } else {
        Alert.alert("Error", registerResponse.message || "Registration failed");
      }
    } catch (error: any) {
      console.error("Farmer registration error:", error);
      Alert.alert(
        "Error",
        error.message ||
          "An error occurred during registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleMerchantRegister = async () => {
    if (
      !merchantRegisterForm.fullName ||
      !merchantRegisterForm.email ||
      !merchantRegisterForm.nrc ||
      !merchantRegisterForm.password
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(merchantRegisterForm.email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (merchantRegisterForm.nrc.trim().length < 5) {
      Alert.alert("Error", "Please enter a valid NRC number");
      return;
    }
    if (merchantRegisterForm.password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register merchant
      const registerRequest: RegisterMerchantRequest = {
        fullName: merchantRegisterForm.fullName,
        email: merchantRegisterForm.email,
        nrc: merchantRegisterForm.nrc,
        password: merchantRegisterForm.password,
      };

      console.log("Registering merchant with:", registerRequest);
      const registerResponse = await registerMerchant(registerRequest);

      if (registerResponse.statusCode === 200) {
        console.log("Merchant registration successful:", registerResponse.data);

        // Step 2: Generate and send OTP to email
        const otpResponse = await generateOTP({
          email: merchantRegisterForm.email,
        });

        if (otpResponse.statusCode === 200) {
          console.log("OTP generated successfully");

          // Show verification modal
          setVerificationEmail(merchantRegisterForm.email);
          setShowVerificationModal(true);

          Alert.alert(
            "အတည်ပြုကုဒ် ပေးပို့ပြီးပါပြီ",
            "အီးမေးလ်အားစစ်ဆေးပြီး အတည်ပြုကုဒ်ကိုရယူပါ။",
          );
        } else {
          Alert.alert(
            "Error",
            otpResponse.message || "Failed to send verification code",
          );
        }
      } else {
        Alert.alert(
          "Error",
          registerResponse.message || "အကောင့်ဖွင့်ခြင်းမအောင်မြင်ပါ",
        );
      }
    } catch (error: any) {
      console.error("Merchant registration error:", error);
      Alert.alert(
        "Error",
        error.message ||
          "An error occurred during registration. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    setIsVerifying(true);
    try {
      const validateRequest: ValidateOTPRequest = {
        email: verificationEmail,
        otpCode: code,
      };

      console.log("Validating OTP:", validateRequest);

      const response = await validateOTP(validateRequest);

      if (response.statusCode === 200) {
        console.log("OTP validation successful:", response);

        // Get the user data based on account type
        let userData;
        if (accountType === "farmer") {
          userData = {
            id: response.data?.userId?.toString() || "4",
            email: verificationEmail,
            role: "farmer",
            name: farmerRegisterForm.fullName,
            token: response.data?.token || "",
          };
        } else {
          userData = {
            id: response.data?.userId?.toString() || "4",
            email: verificationEmail,
            role: "merchant",
            name: merchantRegisterForm.fullName,
            token: response.data?.token || "",
          };
        }

        authLogin(userData);

        setShowVerificationModal(false);

        Alert.alert("Success", "အီးမေးလ်! PlantGuardAI မိသားစုမှကြိုဆိုပါသည်!");

        if (accountType === "farmer") {
          navigation.replace("UserApp");
        } else {
          navigation.replace("MerchantApp");
        }
      } else {
        Alert.alert("Error", response.message || "Verification failed");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      Alert.alert(
        "Error",
        error.message || "အတည်ပြုခြင်းမအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ။",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await generateOTP({
        email: verificationEmail,
      });

      if (response.statusCode === 200) {
        Alert.alert(
          "Success",
          "ပြန်လည်အတည်ပြုကုဒ် အောင်မြင်စွာပေးပို့ပြီးပါပြီ!",
        );
      } else {
        Alert.alert("Error", response.message || "Failed to resend code");
      }
    } catch (error: any) {
      console.error("Resend error:", error);
      Alert.alert(
        "Error",
        error.message || "An error occurred. Please try again.",
      );
    }
  };

  const handleForgotPassword = (email: string) => {
    setForgotPasswordVisible(false);
    Alert.alert(
      "Verification Code Sent",
      `A verification code has been sent to ${email}. Please check your email.`,
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/crops.jpg")}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.7)"]}
        style={styles.overlay}
      >
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {/* Header Section */}
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={styles.header}
              >
                <BlurView intensity={30} tint="light" style={styles.logoCircle}>
                  <LinearGradient
                    colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                    style={styles.logoGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.logoText}>🌱</Text>
                  </LinearGradient>
                </BlurView>
                <Text style={styles.appName}>PlantGuardAI</Text>
                <Text style={styles.tagline}>
                  တောက်ပသော အနာဂတ်ဆီသို့ AI နည်းပညာဖြင့် ခြေလှမ်းကို စတင်လိုက်ပါ
                </Text>
              </Animated.View>

              {/* Auth Card */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                style={styles.card}
              >
                {/* Toggle Buttons */}
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      isLogin && styles.activeToggle,
                    ]}
                    onPress={() => setIsLogin(true)}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isLogin && styles.activeToggleText,
                      ]}
                    >
                      အကောင့်ဝင်ပါ
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleButton,
                      !isLogin && styles.activeToggle,
                    ]}
                    onPress={() => {
                      setIsLogin(false);
                      setAccountType("farmer");
                    }}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        !isLogin && styles.activeToggleText,
                      ]}
                    >
                      အကောင့်ဖွင့်ပါ
                    </Text>
                  </TouchableOpacity>
                </View>

                {isLogin ? (
                  // Login Form
                  <Animated.View
                    entering={SlideInRight.springify()}
                    style={styles.formContainer}
                  >
                    <Text style={styles.formTitle}>ပြန်လည်ကြိုဆိုပါသည်</Text>
                    <Text style={styles.formSubtitle}>
                      အသုံးပြုသူအကောင့်ဖြင့် ဝင်ရောက်ပါ
                    </Text>

                    <View style={styles.inputWrapper}>
                      <Feather
                        name="mail"
                        size={20}
                        color="#4CAF50"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="အီးမေးလ်လိပ်စာ"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={loginForm.email}
                        onChangeText={(text) =>
                          setLoginForm({ ...loginForm, email: text })
                        }
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <Feather
                        name="lock"
                        size={20}
                        color="#4CAF50"
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="လျှို့ဝှက်စာလုံး"
                        placeholderTextColor="#999"
                        secureTextEntry={!showPassword}
                        value={loginForm.password}
                        onChangeText={(text) =>
                          setLoginForm({ ...loginForm, password: text })
                        }
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Feather
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.forgotButton}
                      onPress={() => setForgotPasswordVisible(true)}
                    >
                      <Text style={styles.forgotText}>
                        စကားဝှက်မေ့နေပါသလား?
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mainButton}
                      onPress={handleLogin}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={["#4CAF50", "#2E7D32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.buttonText}>အကောင့်ဝင်ပါ</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  // Register Forms
                  <Animated.View
                    entering={SlideInLeft.springify()}
                    style={styles.formContainer}
                  >
                    <Text style={styles.formTitle}>အကောင့်ဖွင့်ပါ</Text>
                    <Text style={styles.formSubtitle}>
                      အနာဂတ်တောက်ပနိုင်ရန် အကောင့်ဖွင့်ခြင်းဖြင့်စတင်လိုက်ပါ
                    </Text>

                    {/* Account Type Selector */}
                    <View style={styles.accountTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.accountTypeButton,
                          accountType === "farmer" && styles.activeAccountType,
                        ]}
                        onPress={() => setAccountType("farmer")}
                      >
                        <Feather
                          name="user"
                          size={20}
                          color={accountType === "farmer" ? "#FFF" : "#666"}
                        />
                        <Text
                          style={[
                            styles.accountTypeText,
                            accountType === "farmer" &&
                              styles.activeAccountTypeText,
                          ]}
                        >
                          အသုံးပြုသူ
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.accountTypeButton,
                          accountType === "merchant" &&
                            styles.activeAccountType,
                        ]}
                        onPress={() => setAccountType("merchant")}
                      >
                        <Feather
                          name="briefcase"
                          size={20}
                          color={accountType === "merchant" ? "#FFF" : "#666"}
                        />
                        <Text
                          style={[
                            styles.accountTypeText,
                            accountType === "merchant" &&
                              styles.activeAccountTypeText,
                          ]}
                        >
                          ကုန်သည်
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {accountType === "farmer" ? (
                      // Farmer Registration Form
                      <View>
                        <View style={styles.inputWrapper}>
                          <Feather
                            name="user"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="နာမည်အပြည့်အစုံ"
                            placeholderTextColor="#999"
                            value={farmerRegisterForm.fullName}
                            onChangeText={(text) =>
                              setFarmerRegisterForm({
                                ...farmerRegisterForm,
                                fullName: text,
                              })
                            }
                          />
                        </View>

                        <View style={styles.inputWrapper}>
                          <Feather
                            name="mail"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="အီးမေးလ်လိပ်စာ"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={farmerRegisterForm.email}
                            onChangeText={(text) =>
                              setFarmerRegisterForm({
                                ...farmerRegisterForm,
                                email: text,
                              })
                            }
                          />
                        </View>

                        <View style={styles.inputWrapper}>
                          <Feather
                            name="lock"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="လျှို့ဝှက်စာလုံး"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={farmerRegisterForm.password}
                            onChangeText={(text) =>
                              setFarmerRegisterForm({
                                ...farmerRegisterForm,
                                password: text,
                              })
                            }
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Feather
                              name={showPassword ? "eye-off" : "eye"}
                              size={20}
                              color="#999"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // Merchant Registration Form
                      <View>
                        <View style={styles.inputWrapper}>
                          <Feather
                            name="user"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="နာမည်အပြည့်အစုံ"
                            placeholderTextColor="#999"
                            value={merchantRegisterForm.fullName}
                            onChangeText={(text) =>
                              setMerchantRegisterForm({
                                ...merchantRegisterForm,
                                fullName: text,
                              })
                            }
                          />
                        </View>

                        <View style={styles.inputWrapper}>
                          <Feather
                            name="mail"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="အီးမေးလ်လိပ်စာ"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={merchantRegisterForm.email}
                            onChangeText={(text) =>
                              setMerchantRegisterForm({
                                ...merchantRegisterForm,
                                email: text,
                              })
                            }
                          />
                        </View>

                        <View style={styles.inputWrapper}>
                          <Feather
                            name="credit-card"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="မှတ်ပုံတင်နံပါတ်"
                            placeholderTextColor="#999"
                            value={merchantRegisterForm.nrc}
                            onChangeText={(text) =>
                              setMerchantRegisterForm({
                                ...merchantRegisterForm,
                                nrc: text,
                              })
                            }
                          />
                        </View>

                        <View style={styles.inputWrapper}>
                          <Feather
                            name="lock"
                            size={20}
                            color="#4CAF50"
                            style={styles.inputIcon}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="လျှို့ဝှက်စာလုံး"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={merchantRegisterForm.password}
                            onChangeText={(text) =>
                              setMerchantRegisterForm({
                                ...merchantRegisterForm,
                                password: text,
                              })
                            }
                          />
                          <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                          >
                            <Feather
                              name={showPassword ? "eye-off" : "eye"}
                              size={20}
                              color="#999"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.passwordHint}>
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color="#4CAF50"
                      />
                      <Text style={styles.passwordHintText}>
                        လျှို့ဝှက်စာလုံးသည် အနည်းဆုံး ၆ လုံးပါရှိရမည်။
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.mainButton}
                      onPress={
                        accountType === "farmer"
                          ? handleFarmerRegister
                          : handleMerchantRegister
                      }
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={["#4CAF50", "#2E7D32"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientButton}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.buttonText}>
                            {accountType === "farmer"
                              ? "အသုံးပြုသူအကောင့်ဖွင့်ရန်"
                              : "ကုန်သည်အကောင့်ဖွင့်ရန်"}
                          </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>သို့မဟုတ်</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login */}
                <View style={styles.socialContainer}>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="google" size={24} color="#DB4437" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="facebook" size={24} color="#4267B2" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <FontAwesome name="apple" size={24} color="#000" />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Terms */}
              <Animated.View
                entering={FadeInUp.delay(600).springify()}
                style={styles.termsContainer}
              >
                <Text style={styles.termsText}>
                  By continuing, you agree to our{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          visible={forgotPasswordVisible}
          onClose={() => setForgotPasswordVisible(false)}
          onSubmit={handleForgotPassword}
        />

        {/* Email Verification Modal */}
        <EmailVerificationModal
          visible={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          email={verificationEmail}
          onVerify={handleVerifyEmail}
          onResend={handleResendCode}
          isLoading={isVerifying}
        />
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 30,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    marginVertical: 10,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderRadius: 15,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  activeToggle: {
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
  },
  activeToggleText: {
    color: "#2E7D32",
  },
  formContainer: {
    width: "100%",
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8F0E8",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
    height: "100%",
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "600",
  },
  mainButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  passwordHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  passwordHintText: {
    fontSize: 13,
    color: "#2E7D32",
    flex: 1,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
    fontWeight: "600",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8F0E8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  termsContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  termsText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 18,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  termsLink: {
    color: "#FFF",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width - 40,
    backgroundColor: "#FFF",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    padding: 20,
  },
  modalHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBody: {
    padding: 24,
  },
  modalIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 55,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: "#1A1A1A",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  modalSubmitButton: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalSubmitGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  logoText: {
    fontSize: 48,
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
  accountTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  accountTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    gap: 8,
  },
  activeAccountType: {
    backgroundColor: "#4CAF50",
  },
  accountTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  activeAccountTypeText: {
    color: "#FFF",
  },
});

export default AuthScreen;
