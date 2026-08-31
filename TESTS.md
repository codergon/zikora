# Test strategy

## Automated checks

Run:

```sh
yarn lint
yarn typecheck
yarn test
npx expo export --platform android
```

The Jest suite covers:

- deterministic success, rejection, server, offline, timeout, and delayed service outcomes
- bounded cursor pagination over more than 3,000 transactions
- money parsing and formatting in integer minor units
- encrypted-session repository expiry and failure behavior
- transaction pagination, deduplication, refresh retention, and concurrent-load protection
- transfer request-key reuse, repeat-tap protection, and distinct failure states
- login validation, accessibility labels, password visibility, and rejected credentials
- virtualized Home configuration and failed-refresh retention
- Send Money success navigation and unknown-status handling
- receipt content rendering (terminal screen; no back control by design)

Latest local result on 31 August 2026: 9 suites and 36 tests passed. Lint,
TypeScript checking, and Android export also completed successfully.

## Manual Android checks

1. Launch with no stored session and verify login uses Inter Tight.
2. Sign in with the demo credentials and verify Raleway is used after login.
3. Relaunch the app and verify the session is restored.
4. Scroll continuously through the transaction feed and trigger pagination.
5. Pull to refresh and verify existing transactions remain visible with an offline message.
6. Open Send Money, validate empty and malformed fields, and confirm rapid taps create one request.
7. Exercise every transfer remark tag and verify rejected, failed, and unknown outcomes remain distinct.
8. Complete a successful transfer and verify the receipt values; confirm the hardware back button returns to Home.
9. Check screen-reader labels, focus targets, text scaling, keyboard avoidance, and bottom safe-area spacing.
