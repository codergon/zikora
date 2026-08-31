import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { describeNaira } from "../../domain/money";
import { colors } from "../../theme";

type HomeHeaderProps = {
  firstName: string;
  balanceVisible: boolean;
  onToggleBalance: () => void;
  onTransfer?: () => void;
  message: string | null;
};

export function HomeHeader({
  firstName,
  balanceVisible,
  onToggleBalance,
  onTransfer,
  message,
}: HomeHeaderProps) {
  return (
    <View>
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName.slice(0, 1).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.greeting}>Good Afternoon {firstName}</Text>
          <Text style={styles.welcome}>Welcome to Zikora</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add account"
          accessibilityState={{ disabled: true }}
          disabled
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color="#555555" />
        </Pressable>
      </View>

      <View style={styles.accountRow}>
        <Text style={styles.accountText}>Account Number: 0239672836</Text>
        <Ionicons name="copy-outline" size={19} color="#555555" />
      </View>

      <Text style={styles.balanceLabel}>Your Balance</Text>
      <View style={styles.balanceRow}>
        <Text
          accessibilityLabel={
            balanceVisible ? describeNaira(50_000_000) : "Balance hidden"
          }
          style={styles.balance}
        >
          {balanceVisible ? "₦500,000.00" : "₦••••••••"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={balanceVisible ? "Hide balance" : "Show balance"}
          onPress={onToggleBalance}
          hitSlop={12}
        >
          <Ionicons
            name={balanceVisible ? "eye-off-outline" : "eye-outline"}
            size={25}
            color="#555555"
          />
        </Pressable>
      </View>
      <Text style={styles.updated}>Last Updated: 20 mins ago</Text>

      <View style={styles.actionCard}>
        <QuickAction
          label="Transfer"
          icon="swap-horizontal"
          onPress={onTransfer}
        />
        <QuickAction label="Buy Data" icon="phone-portrait-outline" />
        <QuickAction label="Help" icon="help-circle-outline" />
        <QuickAction label="Savings" icon="wallet-outline" />
      </View>

      {message ? (
        <View
          accessible
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.messageBox}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={19}
            color={colors.warning}
          />
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>
    </View>
  );
}

function QuickAction({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={styles.quickAction}
    >
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={25} color={colors.ink} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#DCEEE4",
  },
  avatarText: { color: colors.ink, fontSize: 21, fontWeight: "700" },
  profileCopy: { flex: 1, marginLeft: 12 },
  greeting: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  welcome: { marginTop: 3, color: "#5D5D5D", fontSize: 16 },
  addButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#F1F1F1",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 38,
  },
  accountText: { color: "#5A5A5A", fontSize: 15 },
  balanceLabel: { marginTop: 24, color: "#555555", fontSize: 17 },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  balance: {
    color: colors.ink,
    fontSize: 35,
    lineHeight: 45,
    fontWeight: "600",
  },
  updated: { color: "#666666", fontSize: 14 },
  actionCard: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    paddingVertical: 20,
    borderRadius: 8,
    backgroundColor: colors.greenDark,
  },
  quickAction: { minWidth: 64, alignItems: "center", gap: 8 },
  actionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: "#EEFFF5",
  },
  actionLabel: { color: "#D4D9D6", fontSize: 13 },
  messageBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.warningSoft,
  },
  messageText: { flex: 1, color: colors.warning, fontSize: 13 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 34,
    marginBottom: 15,
  },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: "700" },
  seeAll: { color: "#666666", fontSize: 14 },
});
