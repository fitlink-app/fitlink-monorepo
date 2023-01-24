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
import {useTransactionHistory, useClaimBfit} from './hooks/';
import {TransactionUIModel} from './types';
import WalletModal from './components/WalletModal';
import {
  WalletHeader,
  WalletHistoryCard,
  WalletNotConnectedContent,
} from './components';

const NavbarTitle = () => (
  <View style={{flexDirection: 'row'}}>
    <Icon name="wallet-solid" size={18} color={theme.colors.accent} />
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
  const {data: claims} = useClaimBfit();

  const bfitAmount = getViewBfitValue(me?.bfit_balance);
  const usdAmount = convertBfitToUsd(bfitAmount);

  const openInfoModel = () => {
    openModal(() => <WalletModal.Info />);
  };

  const openComingSoonModal = () => {
    openModal(() => <WalletModal.ComingSoon />);
  };

  const {
    data,
    refresh,
    isRefreshing,
    isLoading: isLoadingTransactions,
  } = useTransactionHistory();

  const renderItem: ListRenderItem<TransactionUIModel> = ({item}) => (
    <WalletHistoryCard key={Number(item.date)} {...item} />
  );

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
            refreshControl={
              <RefreshControl
                tintColor={theme.colors.accent}
                refreshing={isRefreshing}
                onRefresh={refresh}
              />
            }
            data={data}
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
