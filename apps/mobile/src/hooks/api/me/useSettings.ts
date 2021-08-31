import {useMutation} from 'react-query';
import {queryClient, QueryKeys} from '@query';
import api from '@api';
import {useMe} from '.';
import {useReducer} from 'react';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UpdateUserDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {ImagePickerDialogResponse} from 'hooks/useImagePicker';
import {useUpdateAvatar} from './useUpdateAvatar';
import {Image} from '@fitlink/api/src/modules/images/entities/image.entity';
import {useUploadImage} from '../images';
import {ImageType} from '../../../../../api/src/modules/images/images.constants';

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
  avatar?: Image;
  tempAvatar?: ImagePickerDialogResponse; // avatar that is picked in the Settings but not uploaded yet
};

enum ActionType {
  SetName = 'SET_NAME',
  SetGoals = 'SET_GOALS',
  SetUnitSystem = 'SET_UNIT_SYSTEM',
  SetTimezone = 'SET_TIMEZONE',
  SetAvatar = 'SET_AVATAR',
}

type Action =
  | {type: ActionType.SetName; payload: string}
  | {type: ActionType.SetUnitSystem; payload: UnitSystem}
  | {type: ActionType.SetTimezone; payload: string}
  | {type: ActionType.SetGoals; payload: UserGoalPreferences}
  | {type: ActionType.SetAvatar; payload: ImagePickerDialogResponse};

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

    case ActionType.SetAvatar:
      return {
        ...state,
        tempAvatar: action.payload,
      };

    default:
      return state;
  }
}

export function useSettings() {
  const {mutateAsync: updateAvatar} = useUpdateAvatar();
  const {mutateAsync: uploadImage} = useUploadImage();

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
    avatar: user.avatar,
  };

  const [state, dispatch] = useReducer(settingsReducer, initialState);

  /** Whether the state of settings has been changed since hook initialization */
  const didSettingsChange =
    JSON.stringify(initialState) !== JSON.stringify(state);

  // React-query
  const {
    mutateAsync: submitSettings,
    reset: resetSettingsQuery,
    error: settingsError,
    isLoading: isSettingsLoading,
  } = useMutation(
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

  function setAvatar(avatar: ImagePickerDialogResponse) {
    dispatch({type: ActionType.SetAvatar, payload: avatar});
  }

  /** Submits new user settings */
  async function submit() {
    resetSettingsQuery();

    const updatedSettings: UpdateUserDto = {
      name: state.name,
      unit_system: state.unitSystem,
      timezone: state.timezone,
      onboarded: user.onboarded,
      ...state.goals,
    };

    const promises = [submitSettings(updatedSettings)];

    if (state.tempAvatar) {
      const image = await uploadImage({
        image: state.tempAvatar,
        type: ImageType.Avatar,
      });
      await updateAvatar({imageId: image.id});
    }

    return Promise.all(promises);
  }

  return {
    name: state.name,
    goals: state.goals,
    unitSystem: state.unitSystem,
    timezone: state.timezone,
    avatar: state.avatar,
    tempAvatar: state.tempAvatar,
    setName,
    setGoals,
    setUnitSystem,
    setTimezone,
    setAvatar,
    didSettingsChange,
    isLoading: isSettingsLoading,
    error: settingsError,
    submit,
  };
}
