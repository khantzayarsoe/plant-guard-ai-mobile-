import { icons } from "./icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, PressableProps } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
// import { icons } from "../assets/icons";

interface TabBarButtonProps extends PressableProps {
  isFocused: boolean;
  routeName: string;
  label: string | any;
  color?: string;
  activeColor?: string;
  inactiveColor?: string;
}

const TabBarButton = (props: TabBarButtonProps) => {
  const {
    isFocused,
    routeName,
    label,
    color,
    activeColor,
    inactiveColor,
    onPress,
    onLongPress,
  } = props;

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Solution 1: Use type assertion to 'any' for spring config
    scale.value = withSpring(isFocused ? 1 : 0, {
      damping: 12,
      stiffness: 150,
      mass: 1,
    } as any);

    // Solution 2: Or use a simpler approach without problematic properties
    // scale.value = withSpring(isFocused ? 1 : 0, {
    //   damping: 12,
    //   stiffness: 150,
    // });

    opacity.value = withTiming(isFocused ? 1 : 0, {
      duration: 300,
    });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(scale.value, [0, 1], [1, 1.1]);
    return {
      transform: [{ scale: scaleValue }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const opacityValue = interpolate(scale.value, [0, 1], [1, 0]);
    const translateY = interpolate(scale.value, [0, 1], [0, 10]);

    return {
      opacity: opacityValue,
      transform: [{ translateY }],
    };
  });

  const animatedBackgroundStyle = useAnimatedStyle(() => {
    const width = interpolate(scale.value, [0, 0.9], [0, 75]);
    const opacity = interpolate(scale.value, [0, 1], [0, 0.15]);

    return {
      width,
      opacity,
    };
  });

  const getIconComponent = () => {
    const hoverIconName = `${routeName}Hover`;

    if (isFocused && icons[hoverIconName as keyof typeof icons]) {
      return icons[hoverIconName as keyof typeof icons];
    } else if (icons[routeName as keyof typeof icons]) {
      return icons[routeName as keyof typeof icons];
    }
    return icons[routeName as keyof typeof icons] || null;
  };

  const IconComponent = getIconComponent();

  const getIconColor = () => {
    if (isFocused) {
      return activeColor || color || "#007AFF";
    }
    return inactiveColor || "#8E8E93";
  };

  const getIconFill = () => {
    if (isFocused) {
      return activeColor || color || "#007AFF";
    }
    return "transparent";
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.backgroundHighlight,
          animatedBackgroundStyle,
          { backgroundColor: activeColor || color || "#007AFF" },
        ]}
      />

      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {IconComponent && (
          <IconComponent color={getIconColor()} fill={getIconFill()} />
        )}

        <Text
          style={[
            styles.label,
            {
              color: isFocused
                ? activeColor || color || "#007AFF"
                : inactiveColor || "#8E8E93",
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    height: 30,
    position: "relative",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 35,
    height: 32,
  },
  backgroundHighlight: {
    position: "absolute",
    top: -13,
    height: 55,
    borderRadius: 25,
    alignSelf: "center",
  },
  label: {
    fontSize: 9,
    fontWeight: "500",
    marginTop: 2,
  },
});

export default TabBarButton;
