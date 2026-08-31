import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OptionSheet } from "../components/OptionSheet";
import {
  TransferSelector,
  UnderlinedTransferField,
} from "../components/send/TransferField";
import { TransferOutcomeMessage } from "../components/send/TransferOutcomeMessage";
import { PrimaryButton } from "../components/PrimaryButton";
import { TransferInput, TransferOutcome } from "../domain/models";
import { parseNairaToMinorUnits } from "../domain/money";
import { TransferCoordinator } from "../domain/transfer";
import { RootStackParamList } from "../navigation";
import { colors, fonts } from "../theme";

type SendMoneyScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SendMoney"
> & {
  coordinator: TransferCoordinator;
};

type Bank = { code: string; name: string };
type PickerKind = "bank" | "account" | "category";

const banks: readonly Bank[] = [
  { code: "999", name: "Zikora Bank" },
  { code: "044", name: "Demo Access Bank" },
  { code: "058", name: "Demo Trust Bank" },
];
const accountOptions = [
  { key: "primary", label: "Zikora Current", caption: "0239672836" },
];
const categories = ["Transport", "Shopping", "Food", "Family"];
const quickAmounts = [50, 100, 500, 1_000];

export function SendMoneyScreen({
  navigation,
  coordinator,
}: SendMoneyScreenProps) {
  const [bank, setBank] = useState<Bank | null>(null);
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>();
  const [remark, setRemark] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<TransferOutcome | null>(null);

  const amountMinor = useMemo(() => parseNairaToMinorUnits(amount), [amount]);
  const accountError =
    submitted && !/^\d{10}$/.test(accountNumber)
      ? "Enter a valid 10-digit account number."
      : undefined;
  const amountError =
    submitted && (!amountMinor || amountMinor <= 0)
      ? "Enter a valid amount."
      : undefined;
  const bankError =
    submitted && !bank ? "Choose a destination bank." : undefined;
  const valid = Boolean(
    bank && /^\d{10}$/.test(accountNumber) && amountMinor && amountMinor > 0,
  );

  const submit = async () => {
    setSubmitted(true);
    setOutcome(null);
    if (!valid || !bank || !amountMinor) return;

    const input: TransferInput = {
      bankCode: bank.code,
      bankName: bank.name,
      accountNumber,
      accountName: "Nnamdi Demo",
      amountMinor,
      category,
      remark,
    };

    setSubmitting(true);
    const result = await coordinator.submit(input);
    setSubmitting(false);
    setOutcome(result);

    if (result.status === "success") {
      navigation.replace("Receipt", { receipt: result.receipt });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={navigation.goBack}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={25} color={colors.ink} />
          </Pressable>
          <Text style={styles.title}>Send Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TransferSelector
            label="Choose Bank"
            value={bank?.name ?? "Select the bank"}
            placeholder={!bank}
            error={bankError}
            onPress={() => setPicker("bank")}
          />
          <TransferSelector
            label="Your Account"
            value="Zikora Current · 0239672836"
            onPress={() => setPicker("account")}
          />
          <UnderlinedTransferField
            label="Account Number"
            placeholder="Enter Account Number"
            value={accountNumber}
            onChangeText={(value) => setAccountNumber(value.replace(/\D/g, ""))}
            keyboardType="number-pad"
            maxLength={10}
            error={accountError}
          />
          <UnderlinedTransferField
            label="Amount"
            placeholder="Enter Amount to be sent"
            value={amount}
            onChangeText={(value) => setAmount(value.replace(/[^\d.]/g, ""))}
            keyboardType="decimal-pad"
            error={amountError}
          />
          <Text style={styles.feeText}>
            This transfer will attract a charge of ₦10.00
          </Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <Pressable
                key={quickAmount}
                accessibilityRole="button"
                accessibilityLabel={`Set amount to ${quickAmount} naira`}
                onPress={() => setAmount(String(quickAmount))}
                style={styles.amountChip}
              >
                <Text style={styles.amountChipText}>{quickAmount}</Text>
              </Pressable>
            ))}
          </View>
          <TransferSelector
            label="Category"
            optional
            value={category ?? "What is this for?"}
            placeholder={!category}
            onPress={() => setPicker("category")}
          />
          <UnderlinedTransferField
            label="Remark"
            placeholder="Remarks (e.g Shopping)"
            value={remark}
            onChangeText={setRemark}
            maxLength={60}
          />
          {outcome && outcome.status !== "success" ? (
            <TransferOutcomeMessage outcome={outcome} />
          ) : null}
          <PrimaryButton
            label="Continue"
            onPress={submit}
            loading={submitting}
            accessibilityLabel="Submit transfer"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionSheet
        visible={picker === "bank"}
        title="Choose a bank"
        options={banks.map((item) => ({ key: item.code, label: item.name }))}
        selectedKey={bank?.code}
        onSelect={(code) => {
          setBank(banks.find((item) => item.code === code) ?? null);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
      <OptionSheet
        visible={picker === "account"}
        title="Your accounts"
        options={accountOptions}
        selectedKey="primary"
        onSelect={() => setPicker(null)}
        onClose={() => setPicker(null)}
      />
      <OptionSheet
        visible={picker === "category"}
        title="What is this for?"
        options={categories.map((item) => ({ key: item, label: item }))}
        selectedKey={category}
        onSelect={(next) => {
          setCategory(next);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 58,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: colors.ink, fontSize: 20, fontFamily: fonts.bold },
  headerSpacer: { width: 25 },
  content: { paddingHorizontal: 20, paddingBottom: 24, gap: 22 },
  feeText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -17,
    fontFamily: fonts.regular,
  },
  quickAmounts: { flexDirection: "row", gap: 9, marginTop: -14 },
  amountChip: {
    borderWidth: 1,
    borderColor: "#B6B6B6",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  amountChipText: { color: "#707070", fontSize: 12, fontFamily: fonts.medium },
});
