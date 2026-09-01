import { randomUUID } from "expo-crypto";

export function createRequestKey(): string {
  return randomUUID();
}
