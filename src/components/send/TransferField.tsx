import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, fonts } from "../../theme";

export function TransferSelector({
  label,
  value,
  placeholder = false,
  optional = false,
  error,
  onPress,
}: {
  label: string;
  value: string;
  placeholder?: boolean;
  optional?: boolean;
  error?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}>Optional</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        accessibilityState={{ disabled: !onPress }}
        disabled={!onPress}
        onPress={onPress}
        style={[styles.selector, error && styles.errorBorder]}
      >
        <Text style={[styles.selectorText, placeholder && styles.placeholder]}>
          {value}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666666" />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function UnderlinedTransferField({
  label,
  error,
  ...props
}: ComponentProps<typeof TextInput> & { label: string; error?: string }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#858585"
        style={[styles.underlinedInput, error && styles.errorUnderline]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.text, fontSize: 15, fontFamily: fonts.medium },
  optional: { color: colors.green, fontSize: 13, fontFamily: fonts.regular },
  selector: {
    minHeight: 52,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectorText: { color: colors.text, fontSize: 15, fontFamily: fonts.regular },
  placeholder: { color: "#858585" },
  underlinedInput: {
    minHeight: 47,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    color: colors.text,
    fontSize: 15,
    fontFamily: fonts.regular,
  },
  errorBorder: { borderColor: colors.danger },
  errorUnderline: { borderBottomColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, fontFamily: fonts.regular },
});
