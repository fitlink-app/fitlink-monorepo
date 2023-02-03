import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';
import {useSharedValue} from 'react-native-reanimated';
import {format} from 'date-fns';

import {FitButton, NAVBAR_HEIGHT} from '@components';
import {
  useClaimReward,
  useManualQueryRefresh,
  useMe,
  useModal,
  useReward,
} from '@hooks';
import {
  calculateDaysLeft,
  convertBfitToUsd,
  getPositiveValueOrZero,
  getViewBfitValue,
} from '@utils';
import {getErrors} from '@api';
import {ResponseError} from '@fitlink/api-sdk/types';

import DetailedProgressBar from './components/DetailedProgressBar';
import AnimatedHeaderCard from '../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';
import {RedeemSuccessBanner} from './components';
import ErrorContent from '../../components/common/ErrorContent';

const Wrapper = styled.View({
  flex: 1,
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const Reward = (
  props: StackScreenProps<RootStackParamList, 'Reward'>,
) => {
  const {id, image} = props.route.params;
  const {colors} = useTheme();

  const [showAltCurrency, setShowAltCurrency] = useState(false);
  const insets = useSafeAreaInsets();
  const {data: user, isLoading: isLoadingUser, refetch: refetchUser} = useMe();
  const {
    data: reward,
    isLoading: isLoadingReward,
    refetch: refetchReward,
  } = useReward(id);

  const sharedContentOffset = useSharedValue(0);

  const {mutateAsync: claimReward} = useClaimReward();

  const {openModal} = useModal();

  const swapRewardCurrency = () => {
    setShowAltCurrency(prev => !prev);
  };

  const refetch = async () => {
    await Promise.all([refetchUser(), refetchReward()]);
  };

  const {refresh, isRefreshing} = useManualQueryRefresh(refetch);

  if (isLoadingUser || isLoadingReward) {
    return (
      <EmptyContainer style={{marginTop: -(NAVBAR_HEIGHT + insets.top)}}>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  }

  if (!reward || !user) {
    return <ErrorContent isRefreshing={isRefreshing} onRefresh={refresh} />;
  }

  const viewBfitValue = getViewBfitValue(reward.bfit_required);

  const isBfitReward = reward.bfit_required != null;
  const requiredBfitReward = showAltCurrency
    ? `$${convertBfitToUsd(viewBfitValue)}`
    : `${viewBfitValue} BFIT`;
  const requiredPointsReward = `${reward.points_required} Points`;
  const requiredReward = isBfitReward
    ? requiredBfitReward
    : requiredPointsReward;

  const expirationDate = new Date(reward.reward_expires_at);
  const isExpired = new Date() > expirationDate;
  const restDays = calculateDaysLeft(expirationDate, isExpired);

  const expiryDateFormatted = format(
    new Date(reward.reward_expires_at),
    'do MMMM yyyy',
  );

  const p1 = isExpired
    ? `Expired on ${expiryDateFormatted}`
    : `${restDays} DAYS LEFT`;

  const bFitUserBalance = getPositiveValueOrZero(user?.bfit_balance);
  const isReadyToBuy = isBfitReward
    ? bFitUserBalance >= reward.bfit_required
    : user.points_total >= reward.points_required;

  const onClaimReward = async () => {
    try {
      const claimedReward = await claimReward(reward.id);
      openModal(() => (
        <RedeemSuccessBanner
          instructions={claimedReward.redeem_instructions}
          url={claimedReward.redeem_url}
          code={claimedReward.code}
        />
      ));
    } catch (e) {
      console.error('onClaimReward', getErrors(e as ResponseError));
    }
  };

  const isUnableToBuy =
    reward.limit_units && (reward.redeemed || reward.units_available === 0);
  const disabledBuyButtonText = reward.redeemed ? 'REDEEMED' : 'UNAVAILABLE';
  const buyButtonText = isUnableToBuy ? disabledBuyButtonText : 'BUY REWARD';

  return (
    <Wrapper>
      <AnimatedHeaderCard
        headerProps={{
          title: 'REWARD',
        }}
        imageContainerProps={{
          imageSource: {uri: image},
          p1,
          p2: reward.name,
          p3: reward.name_short,
          animatedValue: requiredReward,
          onAnimatedValuePress: isBfitReward ? swapRewardCurrency : undefined,
        }}
        descriptionProps={{
          description: reward.description,
          textStyle: styles.description,
        }}
        sharedContentOffset={sharedContentOffset}>
        {isReadyToBuy ? (
          <FitButton
            disabled={isUnableToBuy}
            style={styles.buy}
            onPress={onClaimReward}
            text={buyButtonText}
            variant="primary"
          />
        ) : (
          <DetailedProgressBar
            height={10}
            width="100%"
            currentValue={
              isBfitReward
                ? getViewBfitValue(user.bfit_balance)
                : user.points_total
            }
            isBfit={isBfitReward}
            requiredValue={
              isBfitReward
                ? getViewBfitValue(reward.bfit_required)
                : reward.points_required
            }
            wrapperStyle={styles.progressWrapper}
          />
        )}
      </AnimatedHeaderCard>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  progressWrapper: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  buy: {
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginHorizontal: 20,
  },
  description: {
    fontWeight: '400',
  },
});
