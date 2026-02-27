// import {
//   AntDesign,
//   Feather,
//   FontAwesome,
//   FontAwesome5,
//   Ionicons,
// } from "@expo/vector-icons";
// import { ComponentType } from "react";

// type IconComponent = ComponentType<{
//   color?: string;
//   fill?: string;
//   size?: number;
// }>;

// type IconsType = {
//   [key: string]: IconComponent;
// };
// // export const icons: IconsType = {};

// export const icons: IconsType = {
//   Home: (props) => <Ionicons name="home-outline" size={24} {...props} />,
//   HomeHover: (props) => <Ionicons name="home" size={24} {...props} />,
//   Shop: (props) => <Feather name="shopping-cart" size={24} {...props} />,
//   ShopHover: (props) => (
//     <FontAwesome name="shopping-cart" size={24} {...props} />
//   ),
//   Profile: (props) => <FontAwesome5 name="user" size={24} {...props} />,
//   ProfileHover: (props) => (
//     <FontAwesome5 name="user-alt" size={24} {...props} />
//   ),
//   Scannervirus: (props) => <AntDesign name="scan" size={26} {...props} />,
//   History: (props) => <AntDesign name="history" size={24} {...props} />,
//   HistoryHover: (props) => <FontAwesome5 name="history" size={26} {...props} />,
// };
import React from "react";
import { ComponentType } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AntDesign from "react-native-vector-icons/AntDesign";

interface IconProps {
  color?: string;
  fill?: string;
  size?: number;
}

type IconComponent = ComponentType<IconProps>;

type IconsType = {
  [key: string]: IconComponent;
};

export const icons: IconsType = {
  Home: (props) => <Ionicons name="home-outline" size={24} {...props} />,
  HomeHover: (props) => <Ionicons name="home" size={24} {...props} />,
  Shop: (props) => <Feather name="shopping-cart" size={24} {...props} />,
  ShopHover: (props) => (
    <FontAwesome name="shopping-cart" size={24} {...props} />
  ),
  Profile: (props) => <FontAwesome5 name="user" size={24} {...props} />,
  ProfileHover: (props) => (
    <FontAwesome5 name="user-alt" size={24} {...props} />
  ),
  Scannervirus: (props) => <AntDesign name="scan" size={26} {...props} />,
  History: (props) => <AntDesign name="history" size={24} {...props} />,
  HistoryHover: (props) => <FontAwesome5 name="history" size={26} {...props} />,
  // ✅ Product icons
  Product: (props) => <Feather name="box" size={24} {...props} />,
  ProductHover: (props) => <Ionicons name="cube" size={24} {...props} />,

  // ✅ Order icons
  Order: (props) => <Feather name="clipboard" size={24} {...props} />,
  OrderHover: (props) => <Ionicons name="receipt" size={24} {...props} />,

  // ✅ Users icons
  Users: (props) => <Feather name="users" size={24} {...props} />,
  UsersHover: (props) => <FontAwesome5 name="users" size={24} {...props} />,
};
