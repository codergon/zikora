import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ReceiptRow } from "../components/receipt/ReceiptRow";
import { formatNaira } from "../domain/money";
import { RootStackParamList } from "../navigation";
import { colors, fonts } from "../theme";

type ReceiptScreenProps = NativeStackScreenProps<RootStackParamList, "Receipt">;

export function ReceiptScreen({ route }: ReceiptScreenProps) {
  const { receipt } = route.params;
  const confirmedAt = new Date(receipt.confirmedAt);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/zikora-logo.png")}
            style={styles.logo}
            accessibilityLabel="Zikora"
          />
          {/* Absolutely centered so the title sits mid-header regardless of
              the logo (or anything) beside it. */}
          <View style={styles.headingWrap} pointerEvents="none">
            <Text style={styles.heading}>TRANSACTION RECEIPT</Text>
          </View>
        </View>
        <View style={styles.dateBar}>
          <Text style={styles.dateText}>
            {confirmedAt.toLocaleString("en-NG", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.details}>
          <ReceiptRow
            label="Transaction Amount"
            value={formatNaira(receipt.amountMinor)}
          />
          <ReceiptRow label="Transaction Type" value="INTER-BANK" />
          <ReceiptRow label="Sender" value={receipt.senderName} />
          <ReceiptRow
            label="Beneficiary"
            value={`${receipt.beneficiaryName}\n${receipt.beneficiaryAccount}\n${receipt.bankName}`}
          />
          <ReceiptRow label="Narration" value={receipt.narration} />
          <ReceiptRow label="Reference" value={receipt.reference} />
          <ReceiptRow
            label="Transaction Status"
            value={"Transfer Request\nSuccessful"}
          />
          <View style={styles.divider} />
          <Text style={styles.disclaimerTitle}>DISCLAIMER</Text>
          <Text style={styles.disclaimer}>
            Please review the details carefully. If a discrepancy is noted,
            contact customer support within 24 hours. This receipt uses mock
            data and does not represent a real bank transaction.
          </Text>
        </View>
        <View style={styles.contactBar}>
          <Text style={styles.contactText}>Contact Zikora support</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { flexGrow: 1 },
  header: {
    minHeight: 95,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  logo: { width: 40, height: 40, resizeMode: "contain" },
  headingWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: "#111111",
    fontSize: 14,
    textAlign: "center",
    fontFamily: fonts.extraBold,
  },
  dateBar: {
    minHeight: 60,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  dateText: {
    color: colors.surface,
    fontSize: 14,
    textAlign: "center",
    fontFamily: fonts.bold,
  },
  details: { paddingHorizontal: 28, paddingTop: 24 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginTop: 5,
  },
  disclaimerTitle: {
    color: "#111111",
    fontSize: 14,
    textAlign: "center",
    marginTop: 15,
    fontFamily: fonts.extraBold,
  },
  disclaimer: {
    color: "#737373",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 28,
    fontFamily: fonts.regular,
  },
  contactBar: {
    minHeight: 66,
    paddingHorizontal: 20,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: { color: colors.surface, fontSize: 14, fontFamily: fonts.bold },
});
