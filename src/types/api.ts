import { Platform } from "react-native";

const DEV_IP = "172.16.2.235"; // ZMT - wifi UCSM

export const BASE_URL = Platform.select({
  android: `http://${DEV_IP}:8081`,
  ios: "http://localhost:8081",
  default: `http://${DEV_IP}:8081`,
})!;
