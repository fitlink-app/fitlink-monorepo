import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';
import {useSharedValue} from 'react-native-reanimated';
import {format} from 'date-fns';

import {FitButton, NAVBAR_HEIGHT} from '@components';
import {useMe, useReward} from '@hooks';
import {calculateDaysLeft, convertBfitToUsd, getViewBfitValue} from '@utils';

import DetailedProgressBar from './components/DetailedProgressBar';
import AnimatedHeaderCard from '../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';

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
  const {data: user} = useMe();
  const {data: reward} = useReward(id);

  const sharedContentOffset = useSharedValue(0);

  const swapRewardCurrency = () => {
    setShowAltCurrency(prev => !prev);
  };

  if (!reward || !user) {
    return (
      <EmptyContainer style={{marginTop: -(NAVBAR_HEIGHT + insets.top)}}>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  }

  const viewBfitValue = getViewBfitValue(reward.bfit_required);

  const isBfitReward = reward.bfit_required !== null;
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

  const bfitProgress = user?.bfit_balance ?? 0 / reward.bfit_required;
  const pointsProgress = user.points_total / reward.points_required;
  const isReadyToBuy = isBfitReward
    ? getViewBfitValue(bfitProgress) >= 1
    : pointsProgress >= 1;

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
            style={styles.buy}
            onPress={() => null} // TODO: add handler
            text="BUY REWARD"
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
