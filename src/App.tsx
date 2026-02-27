// import "react-native-gesture-handler";
// import { Navigation } from "./navigation";

// export function App() {
//   return <Navigation />;
// }

// error clear version but lang doesn't contain
import "react-native-gesture-handler";
import { Navigation } from "./navigation";
import { AuthProvider } from "./navigation/context/AuthContext";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true); // hides all warnings

export function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
