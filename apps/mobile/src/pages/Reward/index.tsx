import React, {useState} from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from 'routes/types';
import {FitButton, NAVBAR_HEIGHT} from '@components';
import {useMe, useReward} from '@hooks';
import {format} from 'date-fns';
import AnimatedHeaderCard from '../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';
import {useSharedValue} from 'react-native-reanimated';
import DetailedProgressBar from './components/DetailedProgressBar';
import {calculateDaysLeft} from '@utils';

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

  const [isBfitReward, setIsBfitReward] = useState(true);

  const insets = useSafeAreaInsets();
  const {data: user} = useMe();
  const {data: reward} = useReward(id);

  const sharedContentOffset = useSharedValue(0);

  const swapRewardCurrency = () => {
    setIsBfitReward(prev => !prev);
  };

  if (!reward || !user) {
    return (
      <EmptyContainer style={{marginTop: -(NAVBAR_HEIGHT + insets.top)}}>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  }

  const requiredReward = isBfitReward
    ? `${reward.points_required} $BFIT`
    : `${reward.points_required * 0.2} $`;
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

  const isReadyToBuy = user.points_total / reward.points_required === 1;

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
          onAnimatedValuePress: swapRewardCurrency,
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
            currentPoint={user.points_total}
            requiredPoint={reward.points_required}
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
