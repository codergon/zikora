import * as SecureStore from "expo-secure-store";

import { SessionStore } from "./sessionRepository";

export const secureSessionStore: SessionStore = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};
