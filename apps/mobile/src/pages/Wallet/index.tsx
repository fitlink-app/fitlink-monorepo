import React, {FC, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {Icon, Label, Navbar} from '@components';
import styled, {useTheme} from 'styled-components/native';
import WalletHistoryCard from './components/WalletHistoryCard';
import theme from '../../theme/themes/fitlink';
import {useMeasureInitialLayout, useModal} from '@hooks';
import PaddedNumber from '../../components/common/numbers/PaddedNumber';
import BarGraph from '../../components/common/plot/BarGraph';
import WalletActions from './components/WalletActions';
import {TransactionUIModel} from './types';
import {useTransactionHistory} from './hooks/useTransactionHistory';
import WalletNotConnectedContent from './components/WalletNotConnectedContent';
import {useWeeklyEarnings} from './hooks/useWeeklyEarnings';
import WalletModal from './components/WalletModal';

const NavbarTitle = () => (
  <View style={{flexDirection: 'row'}}>
    <Icon name="wallet-solid" size={18} color={theme.colors.accent} />
    <WalletLabel>WALLET</WalletLabel>
  </View>
);

interface BalanceProps {
  bfitAmount: number;
  usdAmount: number;
  onInfoPress: () => unknown;
}

const SRow = styled.View({
  flexDirection: 'row',
  marginTop: 10,
});

const SSecondaryText = styled(Label).attrs({
  appearance: 'secondary',
})({
  fontSize: 20,
});

const SSelfCentered = styled.View({alignSelf: 'center', marginLeft: 8});

const Balance: FC<BalanceProps> = ({bfitAmount, usdAmount, onInfoPress}) => (
  <>
    <PaddedNumber
      amount={bfitAmount}
      totalNumberOfDigits={5}
      trailingString="$BFIT"
    />
    <SRow>
      <SSecondaryText>{`${usdAmount} $`}</SSecondaryText>
      <SSelfCentered>
        <Icon
          onPress={onInfoPress}
          color={theme.colors.text}
          size={17}
          name="info"
        />
      </SSelfCentered>
    </SRow>
  </>
);

export const Wallet = () => {
  const {colors} = useTheme();

  const [isConnected] = useState<Boolean>(true);

  const {openModal} = useModal();
  const {measureInitialLayout, initialLayout: initialNavbarLayout} =
    useMeasureInitialLayout();

  const bfitAmount = 640;
  const usdAmount = bfitAmount * 0.2;

  const openInfoModel = () => {
    openModal(() => <WalletModal.Info />);
  };

  const openComingSoonModal = () => {
    openModal(() => <WalletModal.ComingSoon />);
  };

  const {weeklyEarnings} = useWeeklyEarnings();

  const {
    data,
    refresh,
    isRefreshing,
    isLoading: isLoadingTransactions,
  } = useTransactionHistory();

  const renderItem: ListRenderItem<TransactionUIModel> = ({item}) => (
    <WalletHistoryCard key={Number(item.date)} {...item} />
  );

  console.log('isRefreshing', isRefreshing);

  if (!isConnected) {
    return WalletNotConnectedContent;
  }

  const WalletHeader = () => (
    <>
      <SCentered>
        <Balance
          bfitAmount={bfitAmount}
          onInfoPress={openInfoModel}
          usdAmount={usdAmount}
        />
        <BarGraph
          barWidth={8}
          gapWidth={34}
          height={70}
          normalisedData={weeklyEarnings}
          containerStyle={{marginVertical: 20}}
        />
      </SCentered>
      <WalletActions
        onBuy={openComingSoonModal}
        onSell={openComingSoonModal}
        onStock={openComingSoonModal}
      />
      <SListTitle>EARNING HISTORY</SListTitle>
    </>
  );

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
            ListHeaderComponent={WalletHeader}
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

const SListTitle = styled(Label).attrs(() => ({
  type: 'title',
}))({
  marginTop: 40,
  marginBottom: 17,
});

const SCentered = styled.View({
  alignItems: 'center',
});
