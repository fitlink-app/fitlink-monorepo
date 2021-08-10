import {
  createSlice,
  createSelector,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {AuthResultDto} from '@fitlink/api-sdk/types';
import {RootState} from '../reducer';
import {REHYDRATE} from 'redux-persist';
import api, {getErrors} from '@api';
import {queryClient, QueryKeys} from '@query';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {SIGN_UP} from './keys';

type Credentials = {
  email: string;
  password: string;
};

export interface AuthState {
  authResult: AuthResultDto | null;
}

export const initialState: AuthState = {authResult: null};

export const signUp = createAsyncThunk(
  SIGN_UP,
  async (credentials: Credentials, {rejectWithValue}) => {
    try {
      const {me, auth} = await api.signUp(credentials);
      queryClient.setQueryData<User>(QueryKeys.Me, me);
      return auth;
    } catch (e) {
      console.log('here');
      console.log(e.response);
      console.log(getErrors(e));
      console.log('end');
      return rejectWithValue(getErrors(e));
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthResult: (state, {payload}: PayloadAction<AuthResultDto>) => {
      state.authResult = payload;
    },
    clearAuthResult: state => {
      state.authResult = null;
    },
  },
  extraReducers: builder => {
    builder
      // Signup reducers
      .addCase(signUp.fulfilled, (state, {payload}) => {
        if (payload) state.authResult = payload;
      })

      // Rehydrate reducer
      .addCase(REHYDRATE, (state, {payload}: any) => {
        if (!!payload?.auth?.authResult) api.setTokens(payload.auth.authResult);
      });
  },
});

export const selectAuthResult = ({auth: {authResult}}: RootState) => authResult;

export const memoSelectIsAuthenticated = createSelector(
  [selectAuthResult],
  authResult => !!authResult,
);

export const {setAuthResult, clearAuthResult} = authSlice.actions;

export default authSlice.reducer;
