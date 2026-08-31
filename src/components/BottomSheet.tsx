import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { colors } from "../theme";

type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Accessibility label for the dimmed backdrop dismiss target. */
  closeLabel?: string;
};

/**
 * A real bottom sheet: spring entrance, fading backdrop, and drag-to-dismiss
 * via the handle. Stays mounted through its exit animation so it never snaps
 * away. Built on core Animated + PanResponder (no reanimated/gesture-handler)
 * to stay light on the low-memory Android target.
 */
export function BottomSheet({
  visible,
  onClose,
  children,
  closeLabel = "Close",
}: BottomSheetProps) {
  // Consume the context directly (with a fallback) rather than
  // useSafeAreaInsets(), which throws when no provider is mounted — e.g. in
  // component tests that render a screen in isolation.
  const insets = useContext(SafeAreaInsetsContext);
  const bottomInset = insets?.bottom ?? 0;
  const { height: screenHeight } = useWindowDimensions();
  const [rendered, setRendered] = useState(visible);

  // Animated values must survive re-renders; useMemo keeps a single instance
  // without reading a ref during render. Start well off-screen so the first
  // open frame never flashes at rest position.
  const translateY = useMemo(() => new Animated.Value(2000), []);
  const backdrop = useMemo(() => new Animated.Value(0), []);

  // Keep the latest onClose without rebuilding the PanResponder.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const settleOpen = useCallback(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 22,
      stiffness: 240,
      mass: 0.9,
    }).start();
  }, [translateY]);

  const animateOut = useCallback(
    (done?: () => void) => {
      Animated.parallel([
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => finished && done?.());
    },
    [backdrop, screenHeight, translateY],
  );

  useEffect(() => {
    if (visible) {
      // Mount latch so the sheet stays rendered through its exit animation;
      // this is the one place the state legitimately follows the prop.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true);
      translateY.setValue(screenHeight);
      requestAnimationFrame(() => {
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();
        settleOpen();
      });
    } else if (rendered) {
      animateOut(() => setRendered(false));
    }
    // rendered intentionally omitted: it is a mount latch, not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const panResponder = useMemo(
    () =>
      // onCloseRef is read at gesture-release time, never during render, so the
      // stale-closure concern the rule guards against does not apply here.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_, g) => {
          if (g.dy > 110 || g.vy > 0.8) {
            onCloseRef.current();
          } else {
            settleOpen();
          }
        },
      }),
    [settleOpen, translateY],
  );

  if (!rendered) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => onCloseRef.current()}
    >
      <View style={styles.fill}>
        <Animated.View style={[styles.backdrop, { opacity: backdrop }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
            onPress={() => onCloseRef.current()}
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: bottomInset + 16,
              maxHeight: screenHeight * 0.82,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleZone} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(6,20,14,0.45)",
  },
  sheet: {
    paddingTop: 8,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surface,
  },
  handleZone: { alignItems: "center", paddingVertical: 10 },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D2D8D5",
  },
});
