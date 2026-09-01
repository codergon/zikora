# Zikora

Zikora is an Expo React Native banking prototype built for the Mobile Developer Take-Home Challenge. It includes secure mock authentication, a virtualized transaction feed, a duplicate-safe transfer flow, and receipts shown only after confirmed transfers.

## Demo recording

**[▶ Watch the walkthrough:](https://drive.google.com/file/d/1StPlNoQaLfFySajK4ZtdzE9oX0f1FXQw/view?usp=sharing)** cold launch, UI fidelity, scrolling, a failed refresh that keeps cached data, repeat-tap protection, pending/unknown handling, and a confirmed receipt.

## Run the app

Requirements: Node.js 22.13+ or 24.3+, Yarn 1.22, and an Android emulator or Expo Go-compatible device.

```sh
yarn install
yarn android
```

Use `demo@zikora.test` and `Demo123!` to sign in.

## Mock scenarios

The app is fully local and does not contact a banking service. Login scenarios can be exercised with these email addresses and the normal demo password:

- `rejected@zikora.test`
- `server@zikora.test`
- `offline@zikora.test`
- `timeout@zikora.test`
- `delayed@zikora.test`

For transfers, include one of these tags in the remark: `[reject]`, `[server]`, `[offline]`, `[timeout]`, or `[delay]`. A transfer without a tag succeeds. Pull-to-refresh deliberately simulates an offline refresh so the retained-data behavior is visible.

## Implementation notes

- Expo SDK 57, React Native 0.86, and TypeScript, running on the Hermes JS engine
- React Navigation (native stack): Login → Home → Send Money → Receipt
- `react-native-svg` with `react-native-svg-transformer` for the design icon set
- A lightweight custom bottom sheet (core `Animated` + `PanResponder`, no Reanimated) for the bank/account/category pickers
- Expo SecureStore for the authenticated session
- A deterministic local service with 3,200 transactions and bounded cursor pages
- `FlatList` windowing plus deduplication for predictable transaction-feed memory use
- Integer minor units for all monetary calculations
- One request key per transfer intent and one active request at a time
- Raleway across the authenticated experience; Inter Tight on login

Android build mode: runs in Expo Go (JS debug) during development; production bundling is verified with `npx expo export --platform android` (Hermes bytecode).

The UI is split into screens, reusable controls, and feature-specific components. Domain classes contain pagination and transfer-submission rules, while services and repositories isolate infrastructure behavior.

## Quality checks

```sh
yarn lint
yarn typecheck
yarn test
npx expo export --platform android
```

See [TESTS.md](./TESTS.md) for coverage and manual checks, and [PERF.md](./PERF.md) for performance choices and profiling guidance.

## Time spent

Approximately 3 hours 50 minutes of focused working time. An initial stretch
planning the flow and reviewing the designs, followed by implementation, testing, and documentation.

## Tools used

- Expo SDK 57, React Native 0.86, TypeScript, and React Navigation
- `react-native-svg` and `react-native-svg-transformer` for the icon set
- Expo SecureStore; Jest and React Native Testing Library for tests
- AI assistance to audit failure modes, documentation, and refine UI
- No real credentials, accounts, transfers, or banking APIs are used, mock data only.
