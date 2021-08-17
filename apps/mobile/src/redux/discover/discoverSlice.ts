import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ActivityType} from '@fitlink/api/src/modules/activities/activities.constants';
import {RootState} from '../reducer';
// import { Geometry } from 'geojson'

export type DiscoverState = {
  //   currentUserLocation?: Geometry;
  query: string;
  types: ActivityType[];
};

export const initialState: DiscoverState = {
  query: '',
  types: [ActivityType.Class, ActivityType.Group, ActivityType.Route],
};

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    setQuery: (state, {payload}) => {
      state.query = payload;
    },
    toggleType: (state, {payload}: PayloadAction<ActivityType>) => {
      const updatedTypes = [...state.types];

      const index = updatedTypes.indexOf(payload);

      if (index !== -1) {
        updatedTypes.splice(index, 1);
      } else {
        updatedTypes.push(payload);
      }

      state.types = updatedTypes;
    },
  },
});

export const selectQuery = (state: RootState) => state.discover.query;

export const selectTypes = (state: RootState) => state.discover.types;

export const {setQuery, toggleType} = discoverSlice.actions;

export default discoverSlice.reducer;
