import {useMutation} from 'react-query';
import {queryClient, QueryKeys} from '@query';
import api from '@api';
import {useMe} from '.';
import {useReducer} from 'react';
import {
  UnitSystem,
  User,
} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UpdateUserDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';

export type UserGoalPreferences = {
  goal_mindfulness_minutes: number;
  goal_steps: number;
  goal_floors_climbed: number;
  goal_water_litres: number;
  goal_sleep_hours: number;
};

type State = {
  name: string;
  goals: UserGoalPreferences;
  unitSystem: UnitSystem;
  timezone: string;
};

enum ActionType {
  SetName = 'SET_NAME',
  SetGoals = 'SET_GOALS',
  SetUnitSystem = 'SET_UNIT_SYSTEM',
  SetTimezone = 'SET_TIMEZONE',
}

type Action =
  | {type: ActionType.SetName; payload: string}
  | {type: ActionType.SetUnitSystem; payload: UnitSystem}
  | {type: ActionType.SetTimezone; payload: string}
  | {type: ActionType.SetGoals; payload: UserGoalPreferences};

function settingsReducer(state: State, action: Action): State {
  switch (action.type) {
    case ActionType.SetName:
      return {
        ...state,
        name: action.payload,
      };

    case ActionType.SetUnitSystem:
      return {
        ...state,
        unitSystem: action.payload,
      };

    case ActionType.SetTimezone:
      return {
        ...state,
        timezone: action.payload,
      };

    case ActionType.SetGoals:
      return {
        ...state,
        goals: action.payload,
      };

    default:
      return state;
  }
}

export function useSettings() {
  // Set up initial state
  const {data: userData} = useMe({refetchOnMount: false});
  const user = userData!;

  const initialGoals: UserGoalPreferences = {
    goal_mindfulness_minutes: user.goal_mindfulness_minutes || 0,
    goal_steps: user.goal_steps || 0,
    goal_floors_climbed: user.goal_floors_climbed || 0,
    goal_water_litres: user.goal_water_litres || 0,
    goal_sleep_hours: user.goal_sleep_hours || 0,
  };

  // State
  const initialState = {
    name: user.name,
    goals: initialGoals,
    unitSystem: user.unit_system,
    timezone: user.timezone,
  };

  const [state, dispatch] = useReducer(settingsReducer, initialState);

  /** Whether the state of settings has been changed since hook initialization */
  const didSettingsChange =
    JSON.stringify(initialState) !== JSON.stringify(state);

  // React-query
  const {mutateAsync, reset, error, isLoading} = useMutation(
    (updatedSettings: UpdateUserDto) =>
      api.put<User>('/me', {payload: updatedSettings}),
    {
      onSuccess: (data, variables) => {
        queryClient.setQueryData<User>(
          QueryKeys.Me,
          oldUser => ({...oldUser, ...variables} as User),
        );
      },
    },
  );

  function setName(name: string) {
    dispatch({type: ActionType.SetName, payload: name});
  }

  function setGoals(goals: UserGoalPreferences) {
    dispatch({type: ActionType.SetGoals, payload: goals});
  }

  function setUnitSystem(unitSystem: UnitSystem) {
    dispatch({type: ActionType.SetUnitSystem, payload: unitSystem});
  }

  function setTimezone(timezone: string) {
    dispatch({type: ActionType.SetTimezone, payload: timezone});
  }

  /** Submits new user settings */
  async function submit() {
    reset();

    const updatedSettings: UpdateUserDto = {
      name: state.name,
      unit_system: state.unitSystem,
      timezone: state.timezone,
      onboarded: user.onboarded,
      ...state.goals,
    };

    return mutateAsync(updatedSettings);
  }

  return {
    name: state.name,
    goals: state.goals,
    unitSystem: state.unitSystem,
    timezone: state.timezone,
    setName,
    setGoals,
    setUnitSystem,
    setTimezone,
    didSettingsChange,
    isLoading,
    error,
    submit,
  };
}
