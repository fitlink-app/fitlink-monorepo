import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UnitSystem} from '@fitlink//api/src/modules/users/users.constants';
import {Image} from '@fitlink/api/src/modules/images/entities/image.entity';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UpdateUserDto} from '@fitlink/api/src/modules/users/dto/update-user.dto';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {RootState} from '../reducer';
import {ImagePickerDialogResponse} from '@hooks';
import {SUBMIT} from './keys';
import api, {getErrors} from '@api';
import {queryClient, QueryKeys} from '@query';
import {ResponseError} from '@fitlink/api-sdk/types';
import {PrivacySetting} from '@fitlink/api/src/modules/users-settings/users-settings.constants';
import {UpdateUsersSettingDto} from '@fitlink/api/src/modules/users-settings/dto/update-users-setting.dto';

export const PRIVACY_ITEMS = [
  {
    label: 'Private',
    value: PrivacySetting.Private,
  },
  {
    label: 'Only followed users',
    value: PrivacySetting.Following,
  },
  {
    label: 'Public',
    value: PrivacySetting.Public,
  },
];

export type UserGoalPreferences = {
  goal_mindfulness_minutes: number;
  goal_steps: number;
  goal_floors_climbed: number;
  goal_water_litres: number;
  goal_sleep_hours: number;
};

type Settings = {
  name: string;
  goals: UserGoalPreferences;
  unitSystem: UnitSystem;
  timezone: string;
  avatar?: Image;
  tempAvatar?: ImagePickerDialogResponse;
  userSettings?: Partial<UpdateUsersSettingDto>;
};

export type SettingsState = {
  currentState: Settings;
  lastSetState?: Settings;
  isSaving: boolean;
};

export const submit = createAsyncThunk(
  SUBMIT,
  async (_, {rejectWithValue, getState, dispatch}) => {
    const {currentState} = (getState() as RootState).settings;

    try {
      // Update Settings
      const updatedSettings: UpdateUserDto = {
        name: currentState.name,
        unit_system: currentState.unitSystem,
        timezone: currentState.timezone,
        onboarded: true,
        ...currentState.goals,
      };

      await api.put<User>('/me', {payload: updatedSettings});

      if (currentState.userSettings) {
        await api.put<any>('/me/settings', {
          payload: currentState.userSettings,
        });
      }

      // Update avatar if changed
      if (currentState.tempAvatar) {
        const payload = new FormData();

        payload.append('type', ImageType.Avatar);

        payload.append('image', {
          // @ts-ignore
          uri: currentState.tempAvatar.uri,
          type: currentState.tempAvatar.type,
          name:
            currentState.tempAvatar.fileName || new Date().getTime().toString(),
        });

        // Upload image
        const uploadResult = await api.uploadFile<Image>(`/images`, {payload});

        // Update user avatar with the ID of the uploaded image
        await api.put<any>('/me/avatar', {payload: {imageId: uploadResult.id}});

        // Invalidate the user data cache
        queryClient.invalidateQueries(QueryKeys.Me);
      }

      // Update user data in query cache on success
      queryClient.setQueryData<User>(
        QueryKeys.Me,
        oldUser =>
          ({
            ...oldUser,
            ...updatedSettings,
            settings: {...oldUser?.settings, ...currentState.userSettings},
          } as User),
      );

      dispatch(setState(currentState));
    } catch (e) {
      return rejectWithValue(getErrors(e as ResponseError));
    }
  },
);

export const initialState: SettingsState = {
  currentState: {
    name: '',
    goals: {
      goal_mindfulness_minutes: 0,
      goal_steps: 0,
      goal_floors_climbed: 0,
      goal_water_litres: 0,
      goal_sleep_hours: 0,
    },
    userSettings: {
      privacy_daily_statistics: PrivacySetting.Private,
      privacy_activities: PrivacySetting.Private,
    },
    unitSystem: UnitSystem.Imperial,
    timezone: 'Etc/UTC',
  },
  isSaving: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearChanges: state => {
      state = {...initialState};
    },
    setState: (state, {payload}: PayloadAction<Partial<Settings>>) => {
      state.lastSetState = {...state.currentState, ...payload};
      state.currentState = {...state.currentState, ...payload};
    },
    setName: (state, {payload}: PayloadAction<string>) => {
      state.currentState.name = payload;
    },
    setUnitSystem: (state, {payload}: PayloadAction<UnitSystem>) => {
      state.currentState.unitSystem = payload;
    },
    setTimezone: (state, {payload}: PayloadAction<string>) => {
      state.currentState.timezone = payload;
    },
    setGoals: (state, {payload}: PayloadAction<UserGoalPreferences>) => {
      state.currentState.goals = payload;
    },
    setAvatar: (state, {payload}: PayloadAction<ImagePickerDialogResponse>) => {
      state.currentState.tempAvatar = payload;
    },
    setNewsletterSubscription: (state, {payload}: PayloadAction<boolean>) => {
      state.currentState.userSettings = {
        ...state.currentState.userSettings,
        newsletter_subscriptions_user: payload,
      };
    },
    setActivitiesPrivacy: (state, {payload}: PayloadAction<PrivacySetting>) => {
      state.currentState.userSettings = {
        ...state.currentState.userSettings,
        privacy_activities: payload,
      };
    },
    setDailyStatisticsPrivacy: (
      state,
      {payload}: PayloadAction<PrivacySetting>,
    ) => {
      state.currentState.userSettings = {
        ...state.currentState.userSettings,
        privacy_daily_statistics: payload,
      };
    },
  },
  extraReducers: builder => {
    builder
      // Submit reducers
      .addCase(submit.pending, (state, {payload}) => {
        state.isSaving = true;
      })

      .addCase(submit.fulfilled, (state, {payload}) => {
        state.isSaving = false;
      })

      .addCase(submit.rejected, (state, {payload}) => {
        state.isSaving = false;
      });
  },
});

export const selectSettings = (state: RootState) => state.settings.currentState;
export const selectIsSavingSettings = (state: RootState) =>
  state.settings.isSaving;

export const selectDidSettingsChange = (state: RootState) =>
  JSON.stringify(state.settings.currentState) !==
  JSON.stringify(state.settings.lastSetState);

export const {
  clearChanges,
  setState,
  setName,
  setUnitSystem,
  setTimezone,
  setGoals,
  setAvatar,
  setNewsletterSubscription,
  setActivitiesPrivacy,
  setDailyStatisticsPrivacy,
} = settingsSlice.actions;

export default settingsSlice.reducer;
