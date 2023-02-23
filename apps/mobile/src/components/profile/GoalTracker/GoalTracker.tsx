import React from 'react';
import {ScrollView, StyleProp, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/core';

import {useGoals, useModal, useProviders} from '@hooks';
import {
  ProviderType,
  ProviderTypeDisplay,
} from '@fitlink/api/src/modules/providers/providers.constants';

import {Label, Modal} from '../../common';
import styled from 'styled-components/native';
import {Goal} from './components/Goal';

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

export type Tracker = {
  supportedProviders?: ProviderType[];

  /** Identifier of the goal e.g.: "steps" */
  identifier: GoalIdentifier;

  /** Current value and target value of the goal */
  goal: Goal;

  /** Icon name */
  icon: string;
};

interface GoalTrackerProps {
  // If set to false, it won't check enabled providers
  isLocalUser: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const GoalTracker = ({
  isLocalUser,
  containerStyle,
}: GoalTrackerProps) => {
  const navigation = useNavigation();
  const {data: providerList} = useProviders();
  const {openModal, closeModal} = useModal();

  const {data: goals} = useGoals();

  const trackers: Tracker[] = [
    {
      supportedProviders: [
        ProviderType.GoogleFit,
        ProviderType.AppleHealthkit,
        ProviderType.Fitbit,
      ],
      identifier: 'steps',
      goal: {
        value: goals?.current_steps || 0,
        target: goals?.target_steps || 0,
        measure: '',
      },
      icon: 'steps',
    },
    {
      supportedProviders: [ProviderType.GoogleFit, ProviderType.AppleHealthkit],
      identifier: 'mindfulness',
      goal: {
        value: goals?.current_mindfulness_minutes || 0,
        target: goals?.target_mindfulness_minutes || 0,
        measure: 'M',
      },
      icon: 'yoga',
    },
    {
      supportedProviders: [ProviderType.GoogleFit, ProviderType.AppleHealthkit],
      identifier: 'water',
      goal: {
        value: goals?.current_water_litres || 0,
        target: goals?.target_water_litres || 0,
        measure: 'L',
      },
      icon: 'water',
    },
    {
      supportedProviders: [ProviderType.AppleHealthkit, ProviderType.Fitbit],
      identifier: 'sleep',
      goal: {
        value: goals?.current_sleep_hours || 0,
        target: goals?.target_sleep_hours || 0,
        measure: 'H',
      },
      icon: 'sleep',
    },
    {
      supportedProviders: [ProviderType.GoogleFit, ProviderType.AppleHealthkit],
      identifier: 'active_minutes',
      goal: {
        value: goals?.current_active_minutes || 0,
        target: goals?.target_active_minutes || 0,
        measure: 'M',
      },
      icon: 'stopwatch',
    },
    {
      supportedProviders: [
        ProviderType.GoogleFit,
        ProviderType.AppleHealthkit,
        ProviderType.Fitbit,
      ],
      identifier: 'floors',
      goal: {
        value: goals?.current_floors_climbed || 0,
        target: goals?.target_floors_climbed || 0,
        measure: '',
      },
      icon: 'stairs',
    },
  ];

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
            <StyledGoal
              key={identifier}
              {...{goal, icon}}
              onPress={() => showDisabledModal(identifier, supportedProviders!)}
            />
          ),
        )}
      </>
    );
  };

  return (
    <ScrollView
      horizontal
      overScrollMode="never"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        containerStyle,
        {justifyContent: 'space-between'},
      ]}>
      {renderWidgets()}
    </ScrollView>
  );
};
