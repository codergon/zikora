import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts } from "../theme";
import {
  CardIcon,
  CoinIcon,
  HomeIcon,
  Icon,
  ProfileIcon,
  SendIcon,
  SvgIconComponent,
} from "./icon";

type BottomNavProps = {
  active: "home" | "pay";
  onHome: () => void;
  onPay?: () => void;
  onLogout: () => void;
};

const inactiveItems = [
  { label: "Budget", icon: CoinIcon },
  { label: "Cards", icon: CardIcon },
];

export function BottomNav({ active, onHome, onPay, onLogout }: BottomNavProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.shell,
        {
          minHeight: 68 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <NavItem
        label="Home"
        icon={HomeIcon}
        active={active === "home"}
        onPress={onHome}
      />
      <NavItem
        label="Pay"
        icon={SendIcon}
        active={active === "pay"}
        onPress={onPay}
      />
      {inactiveItems.map((item) => (
        <NavItem key={item.label} label={item.label} icon={item.icon} />
      ))}
      <NavItem label="Account" icon={ProfileIcon} onPress={onLogout} />
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
  icon: SvgIconComponent;
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
      <Icon source={icon} size={23} color={active ? colors.ink : "#AAAAAA"} />
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    fontFamily: fonts.regular,
  },
  activeLabel: {
    color: colors.ink,
    fontFamily: fonts.bold,
  },
});
