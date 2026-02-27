// components/SocialButton.tsx
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";

interface SocialButtonProps {
  provider: "google" | "facebook" | "apple";
  onPress: () => void;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  onPress,
  disabled,
}) => {
  const getConfig = () => {
    switch (provider) {
      case "google":
        return {
          icon: "google",
          color: "#DB4437",
          text: "Continue with Google",
        };
      case "facebook":
        return {
          icon: "facebook",
          color: "#4267B2",
          text: "Continue with Facebook",
        };
      case "apple":
        return {
          icon: "apple",
          color: "#000",
          text: "Continue with Apple",
        };
    }
  };

  const config = getConfig();

  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: config.color }]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.content}>
        <Icon name={config.icon} size={20} color={config.color} />
        <Text style={[styles.text, { color: config.color }]}>
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
});

export default SocialButton;
