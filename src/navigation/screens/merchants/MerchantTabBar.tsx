import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBar from "../../components/TabBar";
import MerchantHome from "./MerchantHome";
import Orders from "./History";
import Shops from "./MerchantShop";
import Profile from "./Profile";

const Tab = createBottomTabNavigator();

const MerchantTabBar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={MerchantHome}
        options={{ headerShown: false, title: "Home" }}
      />
      <Tab.Screen
        name="Product"
        component={Shops}
        options={{ headerShown: false, title: "Product" }}
      />
      <Tab.Screen
        name="Order"
        component={Orders}
        options={{ headerShown: false, title: "Order" }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false, title: "Profile" }}
      />
    </Tab.Navigator>
  );
};

export default MerchantTabBar;
