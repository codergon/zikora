import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Transaction } from "../../domain/models";
import { describeNaira, formatNaira } from "../../domain/money";
import { colors } from "../../theme";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const credit = transaction.direction === "credit";
  const occurredAt = new Date(transaction.occurredAt);

  return (
    <View style={styles.row}>
      <View
        style={[styles.icon, credit ? styles.creditIcon : styles.debitIcon]}
      >
        <Ionicons
          name={
            transaction.category === "airtime"
              ? "phone-portrait-outline"
              : "cash-outline"
          }
          size={21}
          color={credit ? colors.green : colors.danger}
        />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {transaction.title}
        </Text>
        <Text style={styles.date}>
          {occurredAt.toLocaleDateString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
      </View>
      <Text
        accessibilityLabel={`${credit ? "Credit" : "Debit"}, ${describeNaira(
          transaction.amountMinor,
        )}`}
        style={[styles.amount, credit ? styles.creditText : styles.debitText]}
      >
        {credit ? "+" : "-"} {formatNaira(transaction.amountMinor)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
  },
  icon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
  },
  creditIcon: { backgroundColor: colors.greenSoft },
  debitIcon: { backgroundColor: colors.dangerSoft },
  copy: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { color: colors.text, fontSize: 16, fontWeight: "600" },
  date: { marginTop: 4, color: "#555555", fontSize: 13 },
  amount: { fontSize: 15, fontWeight: "600" },
  creditText: { color: "#5D9478" },
  debitText: { color: colors.danger },
});
