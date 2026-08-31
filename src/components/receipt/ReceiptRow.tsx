import { StyleSheet, Text, View } from "react-native";

import { fonts } from "../../theme";

export function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text selectable style={styles.value}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 86,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
  },
  label: {
    flex: 1,
    color: "#505050",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  value: {
    flex: 1.25,
    color: "#111111",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    fontFamily: fonts.bold,
  },
});
