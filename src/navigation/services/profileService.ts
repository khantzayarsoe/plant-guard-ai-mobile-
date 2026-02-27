// import { BASE_URL } from "../../types/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export type ProfileResponse = {
//   statusText: string;
//   statusCode: number;
//   message: string;
//   data: {
//     email: string;
//     fullName: string;
//     isEmailVerified: boolean | null;
//     password: string;
//   };
//   errors: null | any;
//   meta: {
//     requestId: string;
//     path: string;
//     timestamp: string;
//     method: string;
//   };
//   pagination: null | any;
// };

// export const fetchFarmerProfile = async (
//   farmerId: string,
// ): Promise<ProfileResponse> => {
//   try {
//     const token = await AsyncStorage.getItem("@PlantGuardAI:token");

//     console.log(`Fetching profile from: ${BASE_URL}/api/farmer/${farmerId}/me`);
//     console.log("Token:", token ? "Present" : "Not present");

//     const response = await fetch(`${BASE_URL}/api/farmer/${farmerId}/me`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });

//     console.log("Response status:", response.status);
//     console.log("Response headers:", response.headers);

//     // Check if response is OK
//     if (!response.ok) {
//       const text = await response.text();
//       console.error("Error response text:", text);
//       throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
//     }

//     // Try to get the response as text first to see what's coming back
//     const text = await response.text();
//     console.log("Raw response:", text.substring(0, 200)); // Log first 200 chars

//     // Try to parse as JSON
//     try {
//       const data = JSON.parse(text);
//       return data;
//     } catch (parseError) {
//       console.error("JSON parse error. Raw response:", text);
//       throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
//     }
//   } catch (error) {
//     console.error("Error in fetchFarmerProfile:", error);
//     throw error;
//   }
// };

// export const fetchMerchantProfile = async (
//   merchantId: string,
// ): Promise<any> => {
//   try {
//     const token = await AsyncStorage.getItem("@PlantGuardAI:token");

//     console.log(
//       `Fetching merchant profile from: ${BASE_URL}/api/merchant/${merchantId}/me`,
//     );
//     console.log("Token:", token ? "Present" : "Not present");

//     const response = await fetch(`${BASE_URL}/api/merchant/${merchantId}/me`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         Authorization: token ? `Bearer ${token}` : "",
//       },
//     });

//     console.log("Response status:", response.status);
//     console.log("Response headers:", response.headers);

//     // Check if response is OK
//     if (!response.ok) {
//       const text = await response.text();
//       console.error("Error response text:", text);
//       throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
//     }

//     // Try to get the response as text first
//     const text = await response.text();
//     console.log("Raw response:", text.substring(0, 200));

//     // Try to parse as JSON
//     try {
//       const data = JSON.parse(text);
//       return data;
//     } catch (parseError) {
//       console.error("JSON parse error. Raw response:", text);
//       throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
//     }
//   } catch (error) {
//     console.error("Error in fetchMerchantProfile:", error);
//     throw error;
//   }
// };
import { authenticatedFetch } from "./authService";
import { BASE_URL } from "../../types/api";

export type MerchantProfileResponse = {
  statusText: string;
  statusCode: number;
  message: string;
  data: {
    fullName: string;
    email: string;
    nrc: string;
    password: string;
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

export const fetchMerchantProfile = async (
  merchantId: string,
): Promise<MerchantProfileResponse> => {
  try {
    console.log("🔍 Fetching merchant profile for ID:", merchantId);
    console.log("🔍 URL:", `${BASE_URL}/api/merchant/${merchantId}/me`);

    // Get token to verify it exists
    const token = await getToken();
    console.log("🔍 Token exists:", !!token);

    const response = await authenticatedFetch(
      `${BASE_URL}/api/merchant/${merchantId}/me`,
      {
        method: "GET",
      },
    );

    console.log("🔍 Response status:", response.status);
    console.log("🔍 Response headers:", response.headers);

    // Check if response is ok
    if (!response.ok) {
      console.error(
        "🔍 Response not OK:",
        response.status,
        response.statusText,
      );
      const errorText = await response.text();
      console.error("🔍 Error response body:", errorText);
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    // Get the response text first
    const responseText = await response.text();
    console.log("🔍 Response text length:", responseText.length);
    console.log("🔍 Response text preview:", responseText.substring(0, 200));

    if (!responseText) {
      throw new Error("Empty response from server");
    }

    // Parse JSON
    const data = JSON.parse(responseText);
    console.log("🔍 Parsed data successfully:", data.statusCode);

    return data;
  } catch (error) {
    console.error("❌ Error fetching merchant profile:", error);
    throw error;
  }
};

// Add missing import
import { getToken } from "./authService";

export const updateMerchantProfile = async (
  merchantId: string,
  profileData: any,
) => {
  try {
    const response = await authenticatedFetch(
      `${BASE_URL}/api/merchant/${merchantId}/me`,
      {
        method: "PUT",
        body: JSON.stringify(profileData),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update error response:", errorText);
      throw new Error(`HTTP error ${response.status}`);
    }

    const responseText = await response.text();
    if (!responseText) {
      throw new Error("Empty response from server");
    }

    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error("Error updating merchant profile:", error);
    throw error;
  }
};
