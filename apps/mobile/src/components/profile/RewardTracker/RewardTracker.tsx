import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {
  Card,
  CardLabel,
  Label,
  TouchHandler,
  TouchHandlerProps,
} from '../../common';

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
  type: 'caption',
}))({
  fontSize: 15,
  letterSpacing: 2,
});

const Points = styled(Label).attrs(() => ({
  type: 'title',
  // numberOfNumbers: 5,
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

export const _RewardTracker = ({...rest}: RewardTrackerProps) => {
  const {colors} = useTheme();

  return (
    <TouchHandler {...rest} disabled={!rest.onPress}>
      <Wrapper>
        <ContentContainer style={{marginLeft: 0}}>
          <Row>
            <PointsLabel>TOTAL $BFIT</PointsLabel>
            <PointsStatusLabel>+23%</PointsStatusLabel>
          </Row>
          <Row>
            <Row>
              <Points style={{color: colors.grayText}}>00</Points>
              <Points>640</Points>
            </Row>
            <PointsChart
              source={require('../../../../assets/images/wallet_chart.png')}
            />
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchHandler>
  );
};

export const RewardTracker = React.memo(_RewardTracker);
