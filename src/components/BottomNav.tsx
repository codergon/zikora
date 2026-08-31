import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

type BottomNavProps = {
  active: "home" | "pay";
  onHome: () => void;
  onPay?: () => void;
  onLogout: () => void;
};

const inactiveItems = [
  { label: "Budget", icon: "pie-chart-outline" as const },
  { label: "Cards", icon: "card-outline" as const },
];

export function BottomNav({ active, onHome, onPay, onLogout }: BottomNavProps) {
  return (
    <View style={styles.shell}>
      <NavItem
        label="Home"
        icon="home-outline"
        active={active === "home"}
        onPress={onHome}
      />
      <NavItem
        label="Pay"
        icon="paper-plane-outline"
        active={active === "pay"}
        onPress={onPay}
      />
      {inactiveItems.map((item) => (
        <NavItem key={item.label} label={item.label} icon={item.icon} />
      ))}
      <NavItem label="Account" icon="person-outline" onPress={onLogout} />
    </View>
  );
}

function NavItem({
  label,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={onPress && label === "Account" ? "Log out" : label}
      accessibilityState={{ selected: active, disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={styles.item}
    >
      <Ionicons name={icon} size={23} color={active ? colors.ink : "#AAAAAA"} />
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#EEEEEE",
    backgroundColor: colors.surface,
  },
  item: {
    minWidth: 58,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  label: {
    color: "#AAAAAA",
    fontSize: 11,
  },
  activeLabel: {
    color: colors.ink,
    fontWeight: "700",
  },
});
