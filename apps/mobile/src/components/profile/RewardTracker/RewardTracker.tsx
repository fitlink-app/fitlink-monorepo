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
  padding: 20,
  paddingLeft: 10,
});

const Row = styled.View({flexDirection: 'row'});

const CardLabelRow = styled(Row)({
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  marginBottom: 10,
});

const ContentContainer = styled.View({
  marginLeft: 10,
  justifyContent: 'center',
  flex: 1,
});

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
        <Row>
          <Icon
            name={'reward'}
            size={LayoutUtils.getPercentageSize(9)}
            color={colors.accentSecondary}
          />

          <ContentContainer>
            {isLoading ? (
              <ActivityIndicator
                color={colors.accent}
                style={{marginLeft: -LayoutUtils.getPercentageSize(9)}}
              />
            ) : (
              <>
                <CardLabelRow>
                  {renderCardLabel()}
                  {showNextReward ? (
                    !claimableRewardsCount && (
                      <Label type={'caption'}>
                        Next reward at{' '}
                        <Label type={'caption'} appearance={'accent'}>
                          {targetPoints}
                        </Label>{' '}
                        points
                      </Label>
                    )
                  ) : (
                    <CardButton text={'View Rewards'} disabled />
                  )}
                </CardLabelRow>

                <ProgressBar
                  {...{progress}}
                  height={10}
                  bloomIntensity={0.5}
                  bloomRadius={8}
                />
              </>
            )}
          </ContentContainer>
        </Row>
      </Wrapper>
    </TouchHandler>
  );
};

export const RewardTracker = React.memo(_RewardTracker);
