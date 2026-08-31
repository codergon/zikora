import { Session } from "../src/domain/models";
import {
  SessionRepository,
  SessionStore,
} from "../src/storage/sessionRepository";

const session: Session = {
  sessionId: "mock-session-1",
  expiresAt: 2_000,
  user: {
    id: "demo-user",
    firstName: "Richard",
    email: "demo@zikora.test",
  },
};

function createStore(initialValue: string | null = null): {
  store: SessionStore;
  getValue: () => string | null;
} {
  let value = initialValue;

  return {
    store: {
      getItem: jest.fn(async () => value),
      setItem: jest.fn(async (_key, nextValue) => {
        value = nextValue;
      }),
      removeItem: jest.fn(async () => {
        value = null;
      }),
    },
    getValue: () => value,
  };
}

describe("SessionRepository", () => {
  test("restores a valid unexpired session without changing stored data", async () => {
    const storedSession = JSON.stringify(session);
    const { store, getValue } = createStore(storedSession);
    const repository = new SessionRepository(store, () => 1_000);

    await expect(repository.load()).resolves.toEqual(session);
    expect(store.removeItem).not.toHaveBeenCalled();
    expect(getValue()).toBe(storedSession);
  });

  test("removes an expired session instead of restoring it", async () => {
    const { store, getValue } = createStore(JSON.stringify(session));
    const repository = new SessionRepository(store, () => session.expiresAt);

    await expect(repository.load()).resolves.toBeNull();
    expect(store.removeItem).toHaveBeenCalledWith("zikora.mock-session");
    expect(getValue()).toBeNull();
  });

  test("removes malformed session data", async () => {
    const { store, getValue } = createStore("{invalid-json");
    const repository = new SessionRepository(store);

    await expect(repository.load()).resolves.toBeNull();
    expect(store.removeItem).toHaveBeenCalledWith("zikora.mock-session");
    expect(getValue()).toBeNull();
  });

  test("does not clear storage when reading the session fails", async () => {
    const store: SessionStore = {
      getItem: jest
        .fn()
        .mockRejectedValue(new Error("Secure storage is unavailable.")),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    const repository = new SessionRepository(store);

    await expect(repository.load()).rejects.toThrow(
      "Secure storage is unavailable.",
    );
    expect(store.removeItem).not.toHaveBeenCalled();
  });

  test("saves and clears the session using one storage key", async () => {
    const { store, getValue } = createStore();
    const repository = new SessionRepository(store);

    await repository.save(session);
    expect(store.setItem).toHaveBeenCalledWith(
      "zikora.mock-session",
      JSON.stringify(session),
    );
    expect(getValue()).toBe(JSON.stringify(session));

    await repository.clear();
    expect(store.removeItem).toHaveBeenCalledWith("zikora.mock-session");
    expect(getValue()).toBeNull();
  });
});
