import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { TransferOutcome } from "../../domain/models";
import { colors, fonts } from "../../theme";

type FailedOutcome = Exclude<TransferOutcome, { status: "success" }>;

export function TransferOutcomeMessage({
  outcome,
}: {
  outcome: FailedOutcome;
}) {
  const unknown = outcome.status === "unknown";

  return (
    <View
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[styles.box, unknown ? styles.unknownBox : styles.failedBox]}
    >
      <Ionicons
        name={unknown ? "time-outline" : "alert-circle-outline"}
        size={20}
        color={unknown ? colors.warning : colors.danger}
      />
      <Text
        style={[styles.text, unknown ? styles.unknownText : styles.failedText]}
      >
        {outcome.message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, borderRadius: 9, flexDirection: "row", gap: 8 },
  unknownBox: { backgroundColor: colors.warningSoft },
  failedBox: { backgroundColor: colors.dangerSoft },
  text: { flex: 1, fontSize: 13, fontFamily: fonts.regular },
  unknownText: { color: colors.warning },
  failedText: { color: colors.danger },
});
