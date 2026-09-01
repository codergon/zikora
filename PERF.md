# Performance notes

## Target

The implementation targets Android 10+ on a 2 GB emulator profile with Hermes enabled by Expo. Release-mode profiling should be used for final memory and frame measurements because development instrumentation changes both.

## Transaction feed

The mock service exposes 3,200 deterministic records through cursor pages capped at 50 items. The UI requests 30 at a time and renders them with `FlatList` using:

- `initialNumToRender={10}`
- `maxToRenderPerBatch={8}`
- `windowSize={7}`
- `removeClippedSubviews`
- stable transaction IDs and a memoized row renderer

Pagination ignores repeated in-flight requests, deduplicates repeated records, and keeps existing rows when refresh fails. This prevents duplicate pages and avoids eagerly mounting thousands of views.

## UI animation

The bank/account/category pickers use a custom bottom sheet built on React
Native's core `Animated` (native driver) and `PanResponder`, deliberately
_not_ Reanimated or `react-native-gesture-handler`. On the 2 GB target this
avoids the extra native modules, worklet runtime, and memory overhead those
libraries add, while still providing a spring entrance, a fading backdrop, and
drag-to-dismiss. The sheet also stays mounted through its exit animation and
unmounts afterwards, so no off-screen sheet views are retained.

Icons are `react-native-svg` components (small vector paths), not bitmap
assets, keeping the icon footprint negligible.

## Observed memory

Measured on the low-memory AVD (Pixel 3a profile, Android 14 / API 34, arm64,
~2.5 GB RAM, the emulator's enforced floor for this system image) running in
Expo Go, via `adb shell dumpsys meminfo host.exp.exponent` (Total PSS). The
figures include Expo Go's own footprint, so treat them as an upper bound rather
than the app in isolation; the trend between stages is what matters.

| Stage                                  | Total PSS |
| -------------------------------------- | --------- |
| After login + first transaction page   | 287 MB    |
| After scrolling through ~3,000 records | 378 MB    |
| After 10× Send Money → Receipt → Home  | 380 MB    |

Memory rises from the first page to a steady state as the virtualized list
recycles through the full data set, then stays essentially flat (+2 MB) across
ten complete transfer round-trips, indicating no per-navigation leak or mass
remount. No freezes, crashes, or OOM occurred during the run.
