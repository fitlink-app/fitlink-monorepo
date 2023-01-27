import React, {useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import styled, {useTheme} from 'styled-components/native';

import {Icon, Label, Navbar} from '@components';
import {useMe, useMeasureInitialLayout, useModal} from '@hooks';
import {convertBfitToUsd, getViewBfitValue} from '@utils';

import theme from '../../theme/themes/fitlink';
import {useWalletTransactions} from './hooks/';
import WalletModal from './components/WalletModal';
import {
  WalletHeader,
  WalletHistoryCard,
  WalletNotConnectedContent,
} from './components';
import {getResultsFromPages} from '../../utils/api';
import {WalletTransaction} from '@fitlink/api/src/modules/wallet-transactions/entities/wallet-transaction.entity';

const NavbarTitle = () => (
  <View style={{flexDirection: 'row'}}>
    <Icon
      style={{justifyContent: 'center'}}
      name="wallet-solid"
      size={18}
      color={theme.colors.accent}
    />
    <WalletLabel>WALLET</WalletLabel>
  </View>
);

export const Wallet = () => {
  const {colors} = useTheme();

  const [isConnected] = useState<Boolean>(true);

  const {openModal} = useModal();
  const {measureInitialLayout, initialLayout: initialNavbarLayout} =
    useMeasureInitialLayout();
  const {data: me} = useMe();
  const {
    refetch,
    isRefetching,
    data: transactionsPages,
    isLoading: isLoadingTransactions,
    fetchNextPage,
  } = useWalletTransactions();

  const transactions = getResultsFromPages(transactionsPages);

  const bfitAmount = getViewBfitValue(me?.bfit_balance);
  const usdAmount = convertBfitToUsd(bfitAmount);

  const openInfoModel = () => {
    openModal(() => <WalletModal.Info />);
  };

  const openComingSoonModal = () => {
    openModal(() => <WalletModal.ComingSoon />);
  };

  const renderItem: ListRenderItem<WalletTransaction> = ({item}) => (
    <WalletHistoryCard key={Number(item.created_at)} {...item} />
  );

  const fetchNextOnEndReached = async () => {
    await fetchNextPage();
  };

  if (!isConnected) {
    return WalletNotConnectedContent;
  }

  const renderSeparator = () => <View style={{height: 26}} />;

  const renderEmptyComponent = () => (
    <>
      {isLoadingTransactions && (
        <ActivityIndicator color={theme.colors.accent} />
      )}
    </>
  );

  return (
    <BottomSheetModalProvider>
      <SFlexed>
        <Navbar
          onLayout={measureInitialLayout}
          containerStyle={{backgroundColor: theme.colors.background}}
          centerComponent={<NavbarTitle />}
          iconColor={colors.text}
        />
        <View style={{paddingTop: initialNavbarLayout.height + 20}}>
          <FlatList
            onEndReached={fetchNextOnEndReached}
            refreshControl={
              <RefreshControl
                tintColor={theme.colors.accent}
                refreshing={isRefetching}
                onRefresh={refetch}
              />
            }
            data={transactions}
            renderItem={renderItem}
            ListHeaderComponent={
              <WalletHeader
                bfitAmount={bfitAmount}
                usdAmount={usdAmount}
                onInfoPress={openInfoModel}
                onBuy={openComingSoonModal}
                onSell={openComingSoonModal}
                onStock={openComingSoonModal}
              />
            }
            ItemSeparatorComponent={renderSeparator}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.contentContainer}
          />
        </View>
      </SFlexed>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 10,
  },
});

const SFlexed = styled.View({
  flex: 1,
});

const WalletLabel = styled(Label).attrs(() => ({
  type: 'title',
  appearance: 'accent',
  bold: true,
}))({
  marginLeft: 11,
});
