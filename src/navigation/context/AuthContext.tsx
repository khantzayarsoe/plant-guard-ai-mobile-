import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { getToken, getUserData, removeAuthData } from "../services/authService";

// Define user type - Added 'farmer' role
export type User = {
  id: string;
  email: string;
  role: "user" | "farmer" | "merchant" | "admin";
  name: string;
  token: string;
} | null;

// Define context type
type AuthContextType = {
  user: User;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  login: (userData: {
    id: string;
    email: string;
    role: string; // Allow string here, we'll validate it
    name: string;
    token: string;
  }) => void;
  logout: () => void;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  setIsLoading: () => {},
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing user data on app start
  useEffect(() => {
    const loadStoredData = async () => {
      const token = await getToken();
      const userData = await getUserData();

      if (token && userData) {
        // Validate and cast the role to the correct type
        let role: "user" | "farmer" | "merchant" | "admin" = "user";

        if (userData.role === "farmer") {
          role = "farmer";
        } else if (userData.role === "merchant") {
          role = "merchant";
        } else if (userData.role === "admin") {
          role = "admin";
        }

        // Create user object from stored data
        const storedUser = {
          id: userData.userId?.toString() || "",
          email: userData.email || "",
          role: role,
          name: userData.name || userData.email?.split("@")[0] || "User",
          token: token,
        };
        setUser(storedUser);
      }
    };

    loadStoredData();
  }, []);

  const login = (userData: {
    id: string;
    email: string;
    role: string;
    name: string;
    token: string;
  }) => {
    // Validate and cast the role
    let role: "user" | "farmer" | "merchant" | "admin" = "user";

    if (userData.role === "farmer") {
      role = "farmer";
    } else if (userData.role === "merchant") {
      role = "merchant";
    } else if (userData.role === "admin") {
      role = "admin";
    }

    const validatedUser = {
      id: userData.id,
      email: userData.email,
      role: role,
      name: userData.name,
      token: userData.token,
    };

    setUser(validatedUser);
  };

  const logout = async () => {
    await removeAuthData();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setIsLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
