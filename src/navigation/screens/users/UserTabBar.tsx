import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import TabBar from "../../components/TabBar";
import TabBar from "../../components/TabBar";
import History from "./History";
import HomeScreen from "./Home";
import ProfileScreen from "./Profile";
// import ProfileScreen from "../merchants/Profile";
import Shop from "./MerchantShop";

const Tab = createBottomTabNavigator();

const UserTabBar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Shop"
        component={Shop}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="History"
        component={History}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default UserTabBar;
