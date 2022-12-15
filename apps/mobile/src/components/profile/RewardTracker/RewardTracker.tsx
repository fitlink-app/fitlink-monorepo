import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {
  Card,
  Icon,
  CardLabel,
  CardButton,
  ProgressBar,
  TouchHandlerProps,
  TouchHandler,
  Label,
} from '../../common';
import {LayoutUtils} from '@utils';
import {ActivityIndicator} from 'react-native';

const Wrapper = styled(Card)({
  width: '100%',
  height: 120,
  paddingTop: 24,
  paddingBottom: 24,
  paddingLeft: 33,
  paddingRight: 33,
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  marginTop: 4,
  marginBottom: 4,
});

const ContentContainer = styled.View({
  marginLeft: 10,
  justifyContent: 'center',
  flex: 1,
});

const PointsLabel = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  color: '#565656',
  letterSpacing: 2,
  fontSize: 13,
});

const PointsStatusLabel = styled(Label).attrs(() => ({
  type: 'caption'
}))({
  fontSize: 15,
  letterSpacing: 2,
});

const Points = styled(Label).attrs(() => ({
  type: 'title'
}))({
  fontSize: 42,
  lineHeight: 48,
});

const PointsChart = styled.Image({});

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

export const _RewardTracker = ({
  points,
  targetPoints,
  claimableRewardsCount,
  showNextReward,
  isLoading,
  ...rest
}: RewardTrackerProps) => {
  const {colors} = useTheme();

  const progress = points / targetPoints;
  const pointsRemainingTillNextReward = targetPoints - points;

  const renderCardLabel = () => {
    let text = `${pointsRemainingTillNextReward} Points remaining`;

    if (claimableRewardsCount > 1) {
      text = `You have ${claimableRewardsCount} unclaimed rewards`;
    } else if (claimableRewardsCount) {
      text = `You have an unclaimed reward`;
    }

    return <CardLabel>{text}</CardLabel>;
  };

  return (
    <TouchHandler {...rest} disabled={!rest.onPress}>
      <Wrapper>
        <ContentContainer>
          <Row>
            <PointsLabel>TOTAL $BFIT</PointsLabel>
            <PointsStatusLabel>+23%</PointsStatusLabel>
          </Row>
          <Row>
            <Points>00640</Points>
            <PointsChart source={require('../../../../assets/images/wallet_chart.png')} />
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchHandler>
  );
};

export const RewardTracker = React.memo(_RewardTracker);
