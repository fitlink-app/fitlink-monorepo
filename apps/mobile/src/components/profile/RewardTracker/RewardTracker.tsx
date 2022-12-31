import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label, TouchHandler, TouchHandlerProps} from '../../common';

const PointsLabel = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  color: '#565656',
  letterSpacing: 2,
  fontSize: 13,
  marginBottom: 9,
});

const PointsStatusLabel = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 15,
  letterSpacing: 2,
});

const Points = styled(Label).attrs(() => ({
  type: 'title',
}))({
  fontSize: 42,
  lineHeight: 48,
});

const PointsChart = styled.Image({flex: 1, marginBottom: 6});

interface RewardTrackerProps extends Omit<TouchHandlerProps, 'disabled'> {
  /** User's points */
  points: number;

  /** Point cost of the closest available reward */
  targetPoints: number;

  /** Number of unlocked rewards that the user can afford with points */
  claimableRewardsCount: number;

  /** Show next reward available label*/
  showNextReward?: boolean;

  isLoading?: boolean;
}

export const _RewardTracker = ({...rest}: RewardTrackerProps) => {
  const {colors} = useTheme();

  return (
    <TouchHandler
      {...rest}
      style={StyleSheet.compose<ViewStyle>(
        {backgroundColor: colors.card},
        styles.wrapper,
      )}
      disabled={!rest.onPress}>
      <View>
        <PointsLabel>TOTAL $BFIT</PointsLabel>
        <View style={styles.totalPointsWrapper}>
          <Points style={{color: colors.grayText}}>00</Points>
          <Points>640</Points>
        </View>
      </View>
      <View>
        <View style={styles.statusPointsWrapper}>
          <PointsStatusLabel>$234.12</PointsStatusLabel>
          <PointsStatusLabel>+23%</PointsStatusLabel>
        </View>
        <PointsChart
          source={require('../../../../assets/images/wallet_chart2.png')}
        />
      </View>
    </TouchHandler>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 120,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 33,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  totalPointsWrapper: {flexDirection: 'row', flex: 1},
  statusPointsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export const RewardTracker = React.memo(_RewardTracker);
