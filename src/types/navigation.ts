import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
export type RootTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
  Settings: undefined;
  Notifications: undefined;
  // Scan: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  HomeDetails: { id: string; title: string };
};
export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  UserTabBar: undefined;
  AuthScreen: undefined;
  Scan: undefined;
  AnalysisResult: {
    imageUri: string;
    analysisData?: {
      aiResult: {
        diseaseName: string;
        probability: string;
      };
      prevention: string;
      pesticides: Array<{
        pesticideId: number;
        pesticideName: string;
        imagePath: string;
      }>;
    };
  };
  Research: undefined;
  CropGuideDetail: { guide: any };
  MerchantTabBar: undefined;
  Auth: undefined;
  UserApp: undefined;
  MerchantApp: undefined;
  AdminApp: undefined;
};

// export type RootStackParamList = {

//   Home: undefined;
//   Login: undefined;
//   UserTabBar: undefined;
//   AuthScreen: undefined;
//   Scan: undefined;
//   AnalysisResult: { imageUri: string };
//   Research: undefined;
//   CropGuideDetail: { guide: any };
//   // CropGuideDetail: { guide: CropGuide };
//   // AnalysisResult: undefined;

//   //merchant
//   MerchantTabBar: undefined;

//   //new

//   Auth: undefined;
//   UserApp: undefined;
//   MerchantApp: undefined;
//   AdminApp: undefined;
// };
// type RootStackParamList = {
//   Home: undefined;
//   Login: undefined;
//   UserTabBar: undefined;
//   AuthScreen: undefined;
//   // Add other screens as needed
// };

// Navigation prop types for screens
export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootTabParamList,
  "Home"
>;

export type SearchScreenNavigationProp = NativeStackNavigationProp<
  RootTabParamList,
  "Search"
>;

export type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootTabParamList,
  "Profile"
>;

//new feature
// Auth Stack Param List
export type AuthStackParamList = {
  AuthHome: undefined;
  AuthScreen: undefined;
  Scan: undefined;
  Research: undefined;
  AnalysisResult: { imageUri?: string };
  CropGuideDetail: { guide: any };
};

// User Stack Param List
export type UserStackParamList = {
  UserTabs: undefined;
};

// Merchant Stack Param List
export type MerchantStackParamList = {
  MerchantTabs: undefined;
};

// Admin Stack Param List
export type AdminStackParamList = {
  AdminTabs: undefined;
};

// Tab Param Lists
export type UserTabParamList = {
  Home: undefined;
  Shop: undefined;
  History: undefined;
  Profile: undefined;
};

export type MerchantTabParamList = {
  MerchantHome: undefined;
  Products: undefined;
  Orders: undefined;
  Profile: undefined;
};

export type AdminTabParamList = {
  AdminHome: undefined;
  Users: undefined;
  Analytics: undefined;
  Settings: undefined;
};

// Navigation prop types for screens
export type AuthScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Auth"
>;

export type AuthScreenRouteProp = RouteProp<AuthStackParamList, "AuthScreen">;

// Combined navigation prop type for AuthScreen
export type AuthScreenProps = {
  navigation: AuthScreenNavigationProp;
  route: AuthScreenRouteProp;
};
