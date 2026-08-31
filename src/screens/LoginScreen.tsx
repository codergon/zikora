import { Ionicons } from "@expo/vector-icons";
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

import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { MockScenario, MockServiceError } from "../services/mockBankApi";
import { colors, fonts } from "../theme";

type LoginScreenProps = {
  onLogin: (
    email: string,
    password: string,
    scenario: MockScenario,
  ) => Promise<void>;
};

const scenarioEmails: Record<string, MockScenario> = {
  "rejected@zikora.test": "rejected",
  "server@zikora.test": "server-error",
  "offline@zikora.test": "offline",
  "timeout@zikora.test": "timeout",
  "delayed@zikora.test": "delayed",
};

const accountTypes = ["Personal Account", "Business Account"] as const;
type AccountType = (typeof accountTypes)[number];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [accountType, setAccountType] = useState<AccountType>("Personal Account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const normalizedEmail = email.trim().toLowerCase();
  const emailError = useMemo(() => {
    if (!submitted && !email) return undefined;
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return "Enter a valid email address.";
    }
    return undefined;
  }, [email, normalizedEmail, submitted]);
  const passwordError = useMemo(() => {
    if (!submitted && !password) return undefined;
    if (password.length < 8) {
      return "Password must contain at least 8 characters.";
    }
    return undefined;
  }, [password, submitted]);

  const canSubmit = !emailError && !passwordError && Boolean(email && password);

  const handleLogin = async () => {
    setSubmitted(true);
    setRequestError(null);
    if (!canSubmit) return;

    setLoading(true);
    try {
      const scenario = scenarioEmails[normalizedEmail] ?? "success";
      const serviceEmail =
        scenario === "success" ? normalizedEmail : "demo@zikora.test";
      await onLogin(serviceEmail, password, scenario);
    } catch (error) {
      setRequestError(
        error instanceof MockServiceError
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.scrim} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.sheet}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.handle} />
          <View style={styles.segmentedControl} accessibilityRole="tablist">
            {accountTypes.map((type) => {
              const selected = type === accountType;
              return (
                <Pressable
                  key={type}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => setAccountType(type)}
                  style={[styles.segment, selected && styles.activeSegment]}
                >
                  <Text
                    style={selected ? styles.activeSegmentText : styles.segmentText}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.title}>Login to your account</Text>

          <FormField
            label="Email"
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            returnKeyType="next"
            editable={!loading}
            error={emailError}
            fontFamily={fonts.loginRegular}
          />
          <FormField
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            autoCapitalize="none"
            autoComplete="password"
            returnKeyType="done"
            editable={!loading}
            error={passwordError}
            fontFamily={fonts.loginRegular}
            onSubmitEditing={handleLogin}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  passwordVisible ? "Hide password" : "Show password"
                }
                onPress={() => setPasswordVisible((visible) => !visible)}
                hitSlop={12}
              >
                <Ionicons
                  name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={colors.text}
                />
              </Pressable>
            }
          />

          <Pressable accessibilityRole="button" style={styles.forgotPassword}>
            <Text style={styles.link}>Forgot Password?</Text>
          </Pressable>

          {requestError ? (
            <View
              accessible
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              style={styles.errorBanner}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.errorText}>{requestError}</Text>
            </View>
          ) : null}

          <PrimaryButton
            label="Login"
            onPress={handleLogin}
            disabled={!canSubmit}
            loading={loading}
            fontFamily={fonts.loginBold}
          />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Don&apos;t have an account?</Text>
            <View style={styles.divider} />
          </View>

          <Pressable accessibilityRole="button" style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Create an account</Text>
          </Pressable>

          <View style={styles.supportRow}>
            <Ionicons name="call-outline" size={21} color="#E88B00" />
            <Text style={styles.supportText}>Contact Support</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.surface },
  scrim: { height: 92, backgroundColor: "#6E7B74" },
  sheet: {
    flexGrow: 1,
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderTopLeftRadius: 38,
    borderTopRightRadius: 38,
    backgroundColor: colors.surface,
  },
  handle: {
    width: 44,
    height: 5,
    alignSelf: "center",
    marginBottom: 6,
    borderRadius: 3,
    backgroundColor: "#9DA8A2",
  },
  segmentedControl: {
    height: 54,
    flexDirection: "row",
    padding: 4,
    borderRadius: 28,
    backgroundColor: "#E8E8E8",
  },
  segment: { flex: 1, alignItems: "center", justifyContent: "center" },
  activeSegment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    backgroundColor: colors.green,
  },
  activeSegmentText: {
    color: colors.surface,
    fontSize: 16,
    fontFamily: fonts.loginSemiBold,
  },
  segmentText: {
    color: "#888888",
    fontSize: 16,
    fontFamily: fonts.loginRegular,
  },
  title: {
    marginTop: 4,
    color: "#050505",
    fontSize: 30,
    lineHeight: 36,
    fontFamily: fonts.loginBold,
  },
  forgotPassword: { alignSelf: "flex-end", marginTop: -12 },
  link: {
    color: colors.green,
    fontSize: 16,
    fontFamily: fonts.loginRegular,
    textDecorationLine: "underline",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    flex: 1,
    color: colors.danger,
    fontSize: 14,
    fontFamily: fonts.loginRegular,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  divider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#BDBDBD",
  },
  dividerText: {
    color: "#999999",
    fontSize: 14,
    fontFamily: fonts.loginRegular,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.green,
    borderRadius: 6,
  },
  secondaryButtonText: {
    color: colors.green,
    fontSize: 17,
    fontFamily: fonts.loginSemiBold,
  },
  supportRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 26,
  },
  supportText: {
    color: "#888888",
    fontSize: 16,
    fontFamily: fonts.loginRegular,
  },
});
