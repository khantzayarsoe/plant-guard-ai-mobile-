import { BASE_URL } from "../../types/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ============ TYPES ============

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    token: string;
    userId: number;
    email: string;
    role: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  role?: string; // Optional role
};

export type RegisterResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    token: string;
    userId: number;
    email: string;
    role: string;
    name?: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type RegisterMerchantRequest = {
  fullName: string;
  email: string;
  nrc: string;
  password: string;
  role?: string; // Optional role
};

export type RegisterMerchantResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    userId: number;
    email: string;
    role: string;
    message?: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type RegisterFarmerRequest = {
  fullName: string;
  email: string;
  password: string;
  role?: string; // Optional role
};

export type RegisterFarmerResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    userId: number;
    email: string;
    role: string;
    message?: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type GenerateOTPRequest = {
  email: string;
};

export type GenerateOTPResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    message: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type ValidateOTPRequest = {
  email: string;
  otpCode: string;
};

export type ValidateOTPResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    token: string;
    userId: number;
    email: string;
    role: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

export type ResendVerificationRequest = {
  email: string;
};

export type ResendVerificationResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    message: string;
  };
  errors: null | any;
  meta: {
    requestId: string;
    path: string;
    timestamp: string;
    method: string;
  };
  pagination: null | any;
};

// ============ STORAGE FUNCTIONS ============

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("userToken", token);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const storeUserData = async (userData: any) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
  } catch (error) {
    console.error("Error storing user data:", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

export const getUserData = async (): Promise<{
  userId: number;
  email: string;
  role: string;
  name?: string;
} | null> => {
  try {
    const data = await AsyncStorage.getItem("userData");
    console.log("Raw userData from storage:", data);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

export const removeAuthData = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  } catch (error) {
    console.error("Error removing auth data:", error);
  }
};

// ============ AUTHENTICATED FETCH ============

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
) => {
  const token = await getToken();

  console.log("🔑 authenticatedFetch - URL:", url);
  console.log("🔑 authenticatedFetch - Token exists:", !!token);
  console.log(
    "🔑 authenticatedFetch - Token preview:",
    token ? `${token.substring(0, 20)}...` : "no token",
  );

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  console.log(
    "🔑 authenticatedFetch - Headers:",
    JSON.stringify(headers, null, 2),
  );

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log("🔑 authenticatedFetch - Response status:", response.status);
    console.log("🔑 authenticatedFetch - Response ok:", response.ok);

    return response;
  } catch (error) {
    console.error("🔑 authenticatedFetch - Network error:", error);
    throw error;
  }
};

// ============ AUTH API FUNCTIONS ============

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  try {
    console.log("🔵 Login URL:", `${BASE_URL}/api/auth/login`);
    console.log("🔵 Login payload:", credentials);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("🔵 Login response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.data?.token) {
      await storeToken(data.data.token);
      await storeUserData({
        userId: data.data.userId,
        email: data.data.email,
        role: data.data.role,
      });
    }

    return data;
  } catch (error) {
    console.error("🔴 Error during login:", error);
    throw error;
  }
};

// Farmer Registration - WITH ROLE FIELD
export const registerFarmer = async (
  userData: RegisterFarmerRequest,
): Promise<RegisterFarmerResponse> => {
  try {
    const url = `${BASE_URL}/api/auth/register/farmer`;

    // Add role to the request payload
    const requestPayload = {
      ...userData,
      role: "farmer",
    };

    console.log("🔵 Register Farmer URL:", url);
    console.log(
      "🔵 Register Farmer payload:",
      JSON.stringify(requestPayload, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    console.log("🔵 Response status:", response.status);

    const contentType = response.headers.get("content-type");
    console.log("🔵 Response content-type:", contentType);

    let responseData;
    let responseText = "";

    try {
      responseText = await response.text();
      console.log(
        "🔵 Raw response (first 200 chars):",
        responseText.substring(0, 200),
      );
    } catch (textError) {
      console.error("🔴 Error reading response text:", textError);
      throw new Error("Failed to read server response");
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = JSON.parse(responseText);
        console.log("🔵 Parsed JSON response:", responseData);
      } catch (parseError) {
        console.error("🔴 Failed to parse JSON response:", parseError);
        throw new Error(
          `Server returned invalid JSON. Status: ${response.status}`,
        );
      }
    } else {
      if (response.ok) {
        return {
          statusCode: response.status,
          statusText: response.statusText,
          message: responseText,
          data: {
            userId: 0,
            email: userData.email,
            role: "farmer",
            message: responseText,
          },
          errors: null,
          meta: {
            requestId: "",
            path: url,
            timestamp: new Date().toISOString(),
            method: "POST",
          },
          pagination: null,
        };
      } else {
        throw new Error(
          `Server error (${response.status}): ${responseText || response.statusText}`,
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        responseData?.message || `Server error: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("🔴 Error during farmer registration:", error);
    throw error;
  }
};

// Merchant Registration - WITH ROLE FIELD
export const registerMerchant = async (
  userData: RegisterMerchantRequest,
): Promise<RegisterMerchantResponse> => {
  try {
    const url = `${BASE_URL}/api/auth/register/merchant`;

    // Add role to the request payload
    const requestPayload = {
      ...userData,
      role: "merchant",
    };

    console.log("🔵 Register Merchant URL:", url);
    console.log(
      "🔵 Register Merchant payload:",
      JSON.stringify(requestPayload, null, 2),
    );

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });

    console.log("🔵 Response status:", response.status);

    const contentType = response.headers.get("content-type");
    console.log("🔵 Response content-type:", contentType);

    let responseData;
    let responseText = "";

    try {
      responseText = await response.text();
      console.log(
        "🔵 Raw response (first 200 chars):",
        responseText.substring(0, 200),
      );
    } catch (textError) {
      console.error("🔴 Error reading response text:", textError);
      throw new Error("Failed to read server response");
    }

    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = JSON.parse(responseText);
        console.log("🔵 Parsed JSON response:", responseData);
      } catch (parseError) {
        console.error("🔴 Failed to parse JSON response:", parseError);
        throw new Error(
          `Server returned invalid JSON. Status: ${response.status}`,
        );
      }
    } else {
      if (response.ok) {
        return {
          statusCode: response.status,
          statusText: response.statusText,
          message: responseText,
          data: {
            userId: 0,
            email: userData.email,
            role: "merchant",
            message: responseText,
          },
          errors: null,
          meta: {
            requestId: "",
            path: url,
            timestamp: new Date().toISOString(),
            method: "POST",
          },
          pagination: null,
        };
      } else {
        throw new Error(
          `Server error (${response.status}): ${responseText || response.statusText}`,
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        responseData?.message || `Server error: ${response.status}`,
      );
    }

    return responseData;
  } catch (error) {
    console.error("🔴 Error during merchant registration:", error);
    throw error;
  }
};

// Generate OTP
export const generateOTP = async (
  emailData: GenerateOTPRequest,
): Promise<any> => {
  try {
    const url = `${BASE_URL}/api/auth/email/otp/generate`;
    console.log("🔵 Generate OTP URL:", url);
    console.log("🔵 Generate OTP payload:", JSON.stringify(emailData, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("🔵 Generate OTP response status:", response.status);

    const responseText = await response.text();
    console.log("🔵 Generate OTP raw response:", responseText);

    if (response.ok) {
      return {
        statusCode: 200,
        message: responseText,
        data: { message: responseText },
      };
    } else {
      throw new Error(responseText || "Failed to generate OTP");
    }
  } catch (error) {
    console.error("🔴 Error generating OTP:", error);
    throw error;
  }
};

// Validate OTP
export const validateOTP = async (
  otpData: ValidateOTPRequest,
): Promise<ValidateOTPResponse> => {
  try {
    const url = `${BASE_URL}/api/auth/email/otp/validate`;
    console.log("🔵 Validate OTP URL:", url);
    console.log("🔵 Validate OTP payload:", JSON.stringify(otpData, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(otpData),
    });

    console.log("🔵 Validate OTP response status:", response.status);

    const responseText = await response.text();
    console.log("🔵 Validate OTP raw response:", responseText);

    // Try to parse as JSON first
    try {
      const data = JSON.parse(responseText);

      if (!response.ok) {
        throw new Error(data.message || "OTP validation failed");
      }

      if (data.data?.token) {
        await storeToken(data.data.token);
        await storeUserData({
          userId: data.data.userId,
          email: data.data.email,
          role: data.data.role,
        });
      }

      return data;
    } catch (parseError) {
      // If it's not JSON but response is OK, it might be a success message
      if (response.ok) {
        return {
          statusCode: 200,
          statusText: "success",
          message: responseText,
          data: {
            token: "",
            userId: 0,
            email: otpData.email,
            role: "farmer",
          },
          errors: null,
          meta: {
            requestId: "",
            path: url,
            timestamp: new Date().toISOString(),
            method: "POST",
          },
          pagination: null,
        } as ValidateOTPResponse;
      } else {
        throw new Error(responseText || "OTP validation failed");
      }
    }
  } catch (error) {
    console.error("🔴 Error during OTP validation:", error);
    throw error;
  }
};

export const resendVerificationCode = async (
  emailData: ResendVerificationRequest,
): Promise<ResendVerificationResponse> => {
  try {
    console.log(
      "🔵 Resend Code URL:",
      `${BASE_URL}/api/auth/resendVerification`,
    );
    console.log("🔵 Resend Code payload:", emailData);

    const response = await fetch(`${BASE_URL}/api/auth/resendVerification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();
    console.log("🔵 Resend Code response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend verification code");
    }

    return data;
  } catch (error) {
    console.error("🔴 Error resending verification code:", error);
    throw error;
  }
};
