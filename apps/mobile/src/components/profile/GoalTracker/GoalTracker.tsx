import React from 'react';
import {Card, Label, Modal, TouchHandler} from '../../common';
import styled from 'styled-components/native';
import {Goal} from './components/Goal';
import {useModal, useProviders} from '@hooks';
import {
  ProviderType,
  ProviderTypeDisplay,
} from '@fitlink/api/src/modules/providers/providers.constants';
import {useNavigation} from '@react-navigation/core';

const Wrapper = styled(Card)({
  paddingVertical: 10,
  backgroundColor: 'transparent !important',
});

// const Title = styled(CardLabel)({
//   marginLeft: 15,
// });

const WidgetContainer = styled.ScrollView.attrs(() => ({
  horizontal: true,
  overScrollMode: 'never',
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    // paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
}))({
  marginTop: 12,
});

const StyledGoal = styled(Goal)({
  marginRight: 15,
});

type GoalIdentifier =
  | 'steps'
  | 'mindfulness'
  | 'floors'
  | 'water'
  | 'sleep'
  | 'active_minutes';

type Tracker = {
  supportedProviders?: ProviderType[];

  /** Identifier of the goal e.g.: "steps" */
  identifier: GoalIdentifier;

  /** Current value and target value of the goal */
  goal: Goal;

  /** Icon name */
  icon: string;
};

interface GoalTrackerProps {
  trackers: Tracker[];

  // If set to false, it won't check enabled providers
  isLocalUser: boolean;
}

export const _GoalTracker = ({trackers, isLocalUser}: GoalTrackerProps) => {
  const navigation = useNavigation();
  const {data: providerList} = useProviders();
  const {openModal, closeModal} = useModal();

  const getUserFriendlyName = (identifier: GoalIdentifier) => {
    switch (identifier) {
      case 'steps':
        return 'Steps Counter';

      case 'mindfulness':
        return 'Mindfulness Minutes Counter';

      case 'floors':
        return 'Floors Climbed Counter';

      case 'water':
        return 'Hydration Counter';

      case 'sleep':
        return 'Sleep Counter';

      case 'active_minutes':
        return 'Active Minutes';

      default:
        return '';
    }
  };

  const showDisabledModal = (
    identifier: GoalIdentifier,
    supportedProviders: ProviderType[],
  ) => {
    const userFriendlyGoalName = getUserFriendlyName(identifier);

    openModal(id => (
      <Modal
        title={userFriendlyGoalName}
        buttons={[
          {
            text: 'Link Tracker',
            onPress: () => {
              navigation.navigate('Settings');
              closeModal(id);
            },
          },
          {
            text: 'Cancel',
            onPress: () => closeModal(id),
            textOnly: true,
          },
        ]}>
        <Label style={{textAlign: 'center'}}>
          This tracker is only supported with the following services:{' '}
          <Label appearance={'primary'} type={'body'} bold>
            {supportedProviders.map((provider, index) => {
              const name =
                ProviderTypeDisplay[
                  provider as keyof typeof ProviderTypeDisplay
                ];

              const isLast = supportedProviders.length === index + 1;
              return name + (isLast ? '' : ', ');
            })}
          </Label>
        </Label>
      </Modal>
    ));
  };

  const renderWidgets = () => {
    let disabledTrackers: Tracker[] = [];
    let enabledTrackers: Tracker[] = [];

    if (isLocalUser) {
      for (const tracker of trackers) {
        if (
          (providerList || []).some(linkedProvider =>
            tracker.supportedProviders!.includes(
              linkedProvider as ProviderType,
            ),
          )
        ) {
          enabledTrackers.push(tracker);
        } else {
          disabledTrackers.push(tracker);
        }
      }
    } else {
      enabledTrackers = [...trackers];
    }
    return (
      <>
        {enabledTrackers.map(({goal, icon, identifier}) => (
          <StyledGoal key={identifier} {...{goal, icon}} />
        ))}

        {disabledTrackers.map(
          ({goal, icon, identifier, supportedProviders}) => (
            <TouchHandler
              onPress={() => {
                showDisabledModal(identifier, supportedProviders!);
              }}>
              <StyledGoal key={identifier} {...{goal, icon}} disabled />
            </TouchHandler>
          ),
        )}
      </>
    );
  };

  return (
    <Wrapper>
      {/* <Title>Today's Goals</Title> */}
      <WidgetContainer>{renderWidgets()}</WidgetContainer>
    </Wrapper>
  );
};

export const GoalTracker = React.memo(_GoalTracker);
