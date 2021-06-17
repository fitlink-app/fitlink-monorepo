import React from 'react';
import {Card, CardLabel} from '../../common';
import styled from 'styled-components/native';
import {Goal} from './components/Goal';

const Wrapper = styled(Card)({
  paddingVertical: 10,
});

const Title = styled(CardLabel)({
  marginLeft: 15,
});

const WidgetContainer = styled.ScrollView.attrs(() => ({
  horizontal: true,
  overScrollMode: 'never',
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
}))({
  marginTop: 12,
});

const StyledGoal = styled(Goal)({
  marginRight: 15,
});

type Tracker = {
  /** Whether this tracker is enabled */
  enabled: boolean;

  /** Identifier of the goal e.g.: "steps" */
  identifier: string;

  /** Current value and target value of the goal */
  goal: Goal;

  /** Icon name */
  icon: string;
};

interface GoalTrackerProps {
  trackers: Tracker[];
}

export const _GoalTracker = ({trackers}: GoalTrackerProps) => {
  const renderWidgets = () => {
    const sortedTrackers: Tracker[] = [...trackers];

    sortedTrackers.sort((a, b) =>
      a.enabled === b.enabled ? 0 : a.enabled ? -1 : 1,
    );

    return sortedTrackers.map(({goal, icon, enabled, identifier}) => (
      <StyledGoal key={identifier} {...{goal, icon}} disabled={!enabled} />
    ));
  };

  return (
    <Wrapper>
      <Title>Today's Goals</Title>
      <WidgetContainer>{renderWidgets()}</WidgetContainer>
    </Wrapper>
  );
};

export const GoalTracker = React.memo(_GoalTracker);
