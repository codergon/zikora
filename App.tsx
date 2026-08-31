import { StatusBar } from "expo-status-bar";
import { InterTight_400Regular } from "@expo-google-fonts/inter-tight/400Regular";
import { InterTight_500Medium } from "@expo-google-fonts/inter-tight/500Medium";
import { InterTight_600SemiBold } from "@expo-google-fonts/inter-tight/600SemiBold";
import { InterTight_700Bold } from "@expo-google-fonts/inter-tight/700Bold";
import { Raleway_400Regular } from "@expo-google-fonts/raleway/400Regular";
import { Raleway_500Medium } from "@expo-google-fonts/raleway/500Medium";
import { Raleway_600SemiBold } from "@expo-google-fonts/raleway/600SemiBold";
import { Raleway_700Bold } from "@expo-google-fonts/raleway/700Bold";
import { Raleway_800ExtraBold } from "@expo-google-fonts/raleway/800ExtraBold";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Session } from "./src/domain/models";
import { TransferCoordinator } from "./src/domain/transfer";
import { RootStackParamList } from "./src/navigation";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ReceiptScreen } from "./src/screens/ReceiptScreen";
import { SendMoneyScreen } from "./src/screens/SendMoneyScreen";
import { MockBankApi, MockScenario } from "./src/services/mockBankApi";
import { createRequestKey } from "./src/services/requestKey";
import { secureSessionStore } from "./src/storage/secureSessionStore";
import { SessionRepository } from "./src/storage/sessionRepository";
import { colors } from "./src/theme";

const api = new MockBankApi();
const sessions = new SessionRepository(secureSessionStore);
const Stack = createNativeStackNavigator<RootStackParamList>();

function transferScenario(remark?: string): MockScenario {
  const normalizedRemark = remark?.toLowerCase() ?? "";
  if (normalizedRemark.includes("[reject]")) return "rejected";
  if (normalizedRemark.includes("[server]")) return "server-error";
  if (normalizedRemark.includes("[offline]")) return "offline";
  if (normalizedRemark.includes("[timeout]")) return "timeout";
  if (normalizedRemark.includes("[delay]")) return "delayed";
  return "success";
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [fontsLoaded, fontError] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold,
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
    Raleway_800ExtraBold,
  });

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        const storedSession = await sessions.load();
        if (active) {
          setSession(storedSession);
        }
      } catch {
        if (active) {
          setSession(null);
        }
      }
    };

    restoreSession();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        restoreSession();
      }
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, scenario: MockScenario) => {
      const authenticatedSession = await api.login(email, password, scenario);
      await sessions.save(authenticatedSession);
      setSession(authenticatedSession);
    },
    [],
  );

  const logout = useCallback(async () => {
    await sessions.clear();
    setSession(null);
  }, []);

  const transferCoordinator = useMemo(
    () =>
      session
        ? new TransferCoordinator({
            createRequestKey,
            submitTransfer: (input, requestKey) =>
              api.submitTransfer(
                input,
                requestKey,
                transferScenario(input.remark),
              ),
          })
        : null,
    [session],
  );

  if (fontError) {
    throw fontError;
  }

  if (session === undefined || !fontsLoaded) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator
          accessibilityLabel="Restoring session"
          color={colors.green}
          size="large"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {session ? (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home">
              {({ navigation }) => (
                <HomeScreen
                  api={api}
                  firstName={session.user.firstName}
                  onLogout={logout}
                  onSendMoney={() => navigation.navigate("SendMoney")}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SendMoney">
              {(props) => (
                <SendMoneyScreen
                  {...props}
                  coordinator={transferCoordinator as TransferCoordinator}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Receipt" component={ReceiptScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
