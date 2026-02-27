// import { BASE_URL } from "../../types/api";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// export const apiClient = async (
//   endpoint: string,
//   options: RequestInit = {},
// ) => {
//   try {
//     const token = await AsyncStorage.getItem("@PlantGuardAI:token");

//     const headers = {
//       "Content-Type": "application/json",
//       ...(token && { Authorization: `Bearer ${token}` }),
//       ...options.headers,
//     };

//     const response = await fetch(`${BASE_URL}${endpoint}`, {
//       ...options,
//       headers,
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || "Request failed");
//     }

//     return data;
//   } catch (error) {
//     console.error("API request failed:", error);
//     throw error;
//   }
// };

import { getToken } from "./authService";
import { BASE_URL } from "../../types/api";

export const apiClient = {
  get: async (endpoint: string) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  put: async (endpoint: string, data: any) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  delete: async (endpoint: string) => {
    const token = await getToken();
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  },
};
