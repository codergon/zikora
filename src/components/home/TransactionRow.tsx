import { StyleSheet, Text, View } from "react-native";

import { Transaction } from "../../domain/models";
import { describeNaira, formatNaira } from "../../domain/money";
import { colors, fonts } from "../../theme";
import { Icon, MoneyReceiveIcon, MoneySendIcon, PhoneIcon } from "../icon";

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const credit = transaction.direction === "credit";
  const airtime = transaction.category === "airtime";
  const occurredAt = new Date(transaction.occurredAt);

  const iconSource = airtime
    ? PhoneIcon
    : credit
      ? MoneyReceiveIcon
      : MoneySendIcon;
  const iconColor = airtime
    ? colors.warning
    : credit
      ? colors.green
      : colors.danger;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          airtime
            ? styles.airtimeIcon
            : credit
              ? styles.creditIcon
              : styles.debitIcon,
        ]}
      >
        <Icon source={iconSource} size={20} color={iconColor} />
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
  airtimeIcon: { backgroundColor: colors.warningSoft },
  copy: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: { color: colors.text, fontSize: 16, fontFamily: fonts.semiBold },
  date: {
    marginTop: 4,
    color: "#555555",
    fontSize: 13,
    fontFamily: fonts.regular,
  },
  amount: { fontSize: 15, fontFamily: fonts.semiBold },
  creditText: { color: "#5D9478" },
  debitText: { color: colors.danger },
});
