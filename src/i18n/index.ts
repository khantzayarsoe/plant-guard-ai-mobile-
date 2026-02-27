import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as RNLocalize from "react-native-localize";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../locales/en.json";
import my from "../locales/my.json";

// Define your resources type for TypeScript
export type Language = "en" | "my";

export const LANGUAGE_PREFERENCE_KEY = "user-language";

const resources = {
  en: { translation: en },
  my: { translation: my },
};

// Detect the best language for the user
const getBestLanguage = async (): Promise<Language> => {
  try {
    // 1. Check if user previously selected a language
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
    if (savedLanguage === "en" || savedLanguage === "my") {
      return savedLanguage as Language;
    }

    // 2. Fallback to device language
    const deviceLanguage = RNLocalize.getLocales()[0]?.languageCode;
    if (deviceLanguage === "my") {
      return "my";
    }
  } catch (e) {
    console.log("Error reading language preference:", e);
  }
  // 3. Default to English
  return "en";
};

export const initializeI18n = async (): Promise<void> => {
  const language = await getBestLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: language,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    compatibilityJSON: "v4", // Important for React Native
  });
};

// Function to change language manually
export const changeLanguage = async (language: Language): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.log("Error changing language:", error);
  }
};

// Type declaration for i18n
declare module "i18next" {
  interface CustomTypeOptions {
    resources: (typeof resources)["en"];
  }
}

export default i18n;
