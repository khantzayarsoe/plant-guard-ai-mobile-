import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import TabBar from "../../components/TabBar";
import Home from "./AdminHome";
import Users from "./User";
// import Analytics from "./Analytics";

import Profile from "./Profile";

const Tab = createBottomTabNavigator();

const AdminTabBar = () => {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false, title: "Home" }}
      />
      <Tab.Screen
        name="Users"
        component={Users}
        options={{ headerShown: false }}
      />
      {/* <Tab.Screen
        name="Analytics"
        component={Analytics}
        options={{ headerShown: false }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabBar;
