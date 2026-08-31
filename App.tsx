import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Session } from "./src/domain/models";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MockBankApi, MockScenario } from "./src/services/mockBankApi";
import { secureSessionStore } from "./src/storage/secureSessionStore";
import { SessionRepository } from "./src/storage/sessionRepository";
import { colors } from "./src/theme";

const api = new MockBankApi();
const sessions = new SessionRepository(secureSessionStore);

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

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

  if (session === undefined) {
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
        <HomeScreen
          api={api}
          firstName={session.user.firstName}
          onLogout={logout}
        />
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
