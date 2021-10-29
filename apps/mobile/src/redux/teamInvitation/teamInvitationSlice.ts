import api, {getErrors} from '@api';
import {ResponseError} from '@fitlink/api-sdk/types';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {RootState} from '../reducer';
import {GET_INVITATION_DATA} from './keys';

export type TeamInvitationState = {
  invitation: Team | null;
  code: string | null;
  isLoading: boolean;
};

export const initialState: TeamInvitationState = {
  invitation: null,
  code: null,
  isLoading: false,
};

export const getInvitationData = createAsyncThunk(
  GET_INVITATION_DATA,
  async (code: string) => {
    try {
      return {data: await api.get<Team>(`/teams/code/${code}`), code};
    } catch (e) {
      const errorMessage = getErrors(e as ResponseError).message;
      console.warn(errorMessage);
    }
  },
);

const teamInvitationSlice = createSlice({
  name: 'teamInvitation',
  initialState,
  reducers: {
    resetTeamInvitation: state => {
      state.invitation = null;
      state.code = null;
      state.isLoading = false;
    },
  },
  extraReducers: builder => {
    builder
      // Signup reducers
      .addCase(getInvitationData.pending, state => {
        state.isLoading = true;
      })

      // Signin reducers
      .addCase(getInvitationData.fulfilled, (state, {payload}) => {
        state.invitation = payload!.data as Team;
        state.code = payload!.code;
        state.isLoading = false;
      })

      // Google Signin reducers
      .addCase(getInvitationData.rejected, state => {
        state.invitation = null;
        state.code = null;
        state.isLoading = false;
      });
  },
});

export const selectTeamInvitation = (state: RootState) => state.teamInvitation;

export const {resetTeamInvitation} = teamInvitationSlice.actions;

export default teamInvitationSlice.reducer;
