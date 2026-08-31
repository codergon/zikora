import { Session } from "../domain/models";

const SESSION_KEY = "zikora.mock-session";

export type SessionStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

function isValidSession(value: unknown, now: number): value is Session {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<Session>;
  return Boolean(
    session.sessionId &&
    Number.isFinite(session.expiresAt) &&
    (session.expiresAt as number) > now &&
    session.user?.id &&
    session.user.firstName &&
    session.user.email,
  );
}

export class SessionRepository {
  constructor(
    private readonly store: SessionStore,
    private readonly now: () => number = Date.now,
  ) {}

  async load(): Promise<Session | null> {
    const storedValue = await this.store.getItem(SESSION_KEY);
    if (!storedValue) {
      return null;
    }

    try {
      const session: unknown = JSON.parse(storedValue);
      if (isValidSession(session, this.now())) {
        return session;
      }
    } catch {
      // Malformed session data is cleared below.
    }

    await this.clear();
    return null;
  }

  async save(session: Session): Promise<void> {
    await this.store.setItem(SESSION_KEY, JSON.stringify(session));
  }

  async clear(): Promise<void> {
    await this.store.removeItem(SESSION_KEY);
  }
}
