// import { createStaticNavigation } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import HomeScreen from "./screens/auth/Home";
// import UserHome from "./screens/UserHome";

// const RootStack = createNativeStackNavigator({
//   screens: {
//     Home: HomeScreen,
//   },
// });

// export const Navigation = createStaticNavigation(RootStack);

// testing v-1.0
// import { createStaticNavigation } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import HomeScreen from "./screens/auth/Home";
// import UserHome from "./screens/users/UserHome";
// import AuthHome from "./screens/auth/Home";
// import AuthScreen from "./screens/auth/AuthScreen";

// // Define your stack navigator
// const Stack = createNativeStackNavigator({
//   screens: {
//     Home: {
//       screen: HomeScreen,
//       options: {
//         title: "Welcome",
//       },
//     },
//     UserHome: {
//       screen: UserHome,
//       options: {
//         headerShown: false, // Hide the header for UserHome
//       },
//     },
//     AuthHome: {
//       screen: AuthHome,
//       options: {
//         headerShown: false, // Hide the header for UserHome
//       },
//     },
//     AuthScreen: {
//       screen: AuthScreen,
//       options: {
//         headerShown: false, // Hide the header for UserHome
//       },
//     },
//   },
// });

// export const Navigation = createStaticNavigation(Stack);

//fixing

import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Auth Screens
import AuthScreen from "./screens/auth/AuthScreen";
import AuthHome from "./screens/auth/AuthHome";

// User Screens
import UserTabBar from "./screens/users/UserTabBar";
import Profile from "./screens/users/Profile";
import History from "./screens/users/History";
import Shop from "./screens/users/MerchantShop";
import Scan from "./screens/users/Scan";
import AnalysisResult from "./screens/users/AnalysisResult";
import Research from "./screens/users/Research";
import CropGuideDetail from "./screens/users/CropGuideDetail";

// Merchant Screens
import MerchantProfile from "./screens/merchants/Profile";
import MerchantTabBar from "./screens/merchants/MerchantTabBar";
import MerchantHome from "./screens/merchants/MerchantHome";
import MerchantShop from "./screens/merchants/MerchantShop";
import MerchantOrders from "./screens/users/History";

import AdminTabBar from "./screens/admin/AdminTabBar";

// Components
import TabBar from "./components/TabBar";

// ============ USER TAB NAVIGATOR ============
const UserTab = createBottomTabNavigator({
  screens: {
    Home: {
      screen: UserTabBar,
      options: {
        headerShown: false,
        tabBarLabel: "Home",
      },
    },
    Shop: {
      screen: Shop,
      options: {
        headerShown: false,
        tabBarLabel: "Shop",
      },
    },
    History: {
      screen: History,
      options: {
        headerShown: false,
        tabBarLabel: "History",
      },
    },
    Profile: {
      screen: Profile,
      options: {
        headerShown: false,
        tabBarLabel: "Profile",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
  tabBar: (props: any) => <TabBar {...props} />,
});

// ============ USER STACK (includes tab navigator + modal screens) ============
const UserStack = createNativeStackNavigator({
  screens: {
    UserTabs: {
      screen: UserTab,
      options: {
        headerShown: false,
      },
    },
    Scan: {
      screen: Scan,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
    Research: {
      screen: Research,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
    AnalysisResult: {
      screen: AnalysisResult,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
    CropGuideDetail: {
      screen: CropGuideDetail,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

// ============ MERCHANT STACK ============
const MerchantStack = createNativeStackNavigator({
  screens: {
    MerchantTabs: {
      screen: MerchantTabBar,
      options: {
        headerShown: false,
      },
    },
    // Add merchant modal screens here if needed
    Scan: {
      screen: Scan,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

// ============ ADMIN STACK ============
const AdminStack = createNativeStackNavigator({
  screens: {
    AdminTabs: {
      screen: AdminTabBar,
      options: {
        headerShown: false,
      },
    },
    // Add admin modal screens here if needed
    Scan: {
      screen: Scan,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

// ============ AUTH STACK ============
const AuthStack = createNativeStackNavigator({
  screens: {
    AuthHome: {
      screen: AuthHome, // AdminTabBar MerchantTabBar UserTab AuthHome
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
      },
    },
    AuthScreen: {
      screen: AuthScreen,
      options: {
        headerShown: false,
        animation: "fade",
      },
    },
    Scan: {
      screen: Scan,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

// ============ ROOT STACK ============
const RootStack = createNativeStackNavigator({
  screens: {
    Auth: {
      screen: AuthStack,
      options: {
        headerShown: false,
      },
    },
    UserApp: {
      screen: UserStack,
      options: {
        headerShown: false,
      },
    },
    MerchantApp: {
      screen: MerchantStack,
      options: {
        headerShown: false,
      },
    },
    AdminApp: {
      screen: AdminStack,
      options: {
        headerShown: false,
      },
    },
    Scan: {
      screen: Scan,
      options: {
        headerShown: false,
        animation: "slide_from_bottom",
        presentation: "fullScreenModal",
      },
    },
  },
  screenOptions: {
    headerShown: false,
  },
});

export const Navigation = createStaticNavigation(RootStack);
