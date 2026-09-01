import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomNav } from "../components/BottomNav";
import { HomeHeader } from "../components/home/HomeHeader";
import { TransactionRow } from "../components/home/TransactionRow";
import { Transaction } from "../domain/models";
import { TransactionFeed } from "../domain/transactions";
import { MockBankApi } from "../services/mockBankApi";
import { colors, fonts } from "../theme";

type HomeScreenProps = {
  api: MockBankApi;
  firstName: string;
  onLogout: () => void;
  onSendMoney?: () => void;
};

export function HomeScreen({
  api,
  firstName,
  onLogout,
  onSendMoney,
}: HomeScreenProps) {
  const [feed] = useState(() => new TransactionFeed());
  const [transactions, setTransactions] = useState<readonly Transaction[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const fetchPage = useCallback(
    (cursor: string | null) => api.fetchTransactions({ cursor, limit: 30 }),
    [api],
  );

  useEffect(() => {
    let active = true;

    feed
      .loadNext(fetchPage)
      .then(() => {
        if (active) {
          setTransactions([...feed.items]);
        }
      })
      .catch(() => {
        if (active) {
          setMessage("Transactions could not be loaded. Pull down to retry.");
        }
      })
      .finally(() => {
        if (active) {
          setInitialLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [feed, fetchPage]);

  const loadMore = useCallback(async () => {
    if (loadingMore || feed.cursor === null) return;

    setLoadingMore(true);
    try {
      await feed.loadNext(fetchPage);
      setTransactions([...feed.items]);
    } catch {
      setMessage("More transactions could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  }, [feed, fetchPage, loadingMore]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setMessage(null);

    const refreshed = await feed.refresh((cursor) =>
      api.fetchTransactions({ cursor, limit: 30, scenario: "offline" }),
    );

    if (!refreshed) {
      setMessage("Refresh failed. Your saved transactions are still shown.");
    }
    setTransactions([...feed.items]);
    setRefreshing(false);
  }, [api, feed]);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => <TransactionRow transaction={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        testID="transaction-list"
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.content}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.green}
          />
        }
        ListHeaderComponent={
          <HomeHeader
            firstName={firstName}
            balanceVisible={balanceVisible}
            onToggleBalance={() => setBalanceVisible((visible) => !visible)}
            onTransfer={onSendMoney}
            message={message}
          />
        }
        ListEmptyComponent={
          initialLoading ? (
            <ActivityIndicator style={styles.loader} color={colors.green} />
          ) : (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              style={styles.footerLoader}
              color={colors.green}
            />
          ) : null
        }
      />
      <BottomNav
        active="home"
        onHome={() => undefined}
        onPay={onSendMoney}
        onLogout={onLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: 20, paddingBottom: 18 },
  loader: { marginTop: 48 },
  footerLoader: { marginVertical: 18 },
  emptyText: {
    marginTop: 48,
    color: colors.muted,
    textAlign: "center",
    fontFamily: fonts.regular,
  },
});
