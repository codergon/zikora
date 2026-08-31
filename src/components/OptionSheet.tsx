import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "../theme";
import { BottomSheet } from "./BottomSheet";

export type SheetOption = {
  key: string;
  label: string;
  caption?: string;
};

type OptionSheetProps = {
  visible: boolean;
  title: string;
  options: readonly SheetOption[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
};

/** A list picker rendered inside the real BottomSheet. */
export function OptionSheet({
  visible,
  title,
  options,
  selectedKey,
  onSelect,
  onClose,
}: OptionSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} closeLabel={`Close ${title}`}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {options.map((option) => {
          const selected = option.key === selectedKey;
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected }}
              onPress={() => onSelect(option.key)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={styles.mark}>
                <Text style={styles.markText}>{option.label.slice(0, 1)}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.label}>{option.label}</Text>
                {option.caption ? (
                  <Text style={styles.caption}>{option.caption}</Text>
                ) : null}
              </View>
              {selected ? (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.green}
                />
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: colors.ink,
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  row: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rowPressed: { backgroundColor: colors.greenSoft },
  mark: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.greenSoft,
  },
  markText: { color: colors.ink, fontSize: 16, fontFamily: fonts.bold },
  copy: { flex: 1 },
  label: { color: colors.text, fontSize: 15, fontFamily: fonts.semiBold },
  caption: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 13,
    fontFamily: fonts.regular,
  },
});
