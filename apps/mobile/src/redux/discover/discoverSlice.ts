import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ActivityType} from '@fitlink/api/src/modules/activities/activities.constants';
import {RootState} from '../reducer';
import {LatLng} from '@utils';

export type DiscoverState = {
  currentLocation?: LatLng;
  query: string;
  types: ActivityType[];
  searchLocation?: LatLng;
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
    setSearchLocation: (state, {payload}: PayloadAction<LatLng>) => {
      state.searchLocation = payload;
    },
    setCurrentLocation: (state, {payload}: PayloadAction<LatLng>) => {
      state.currentLocation = payload;
    },
  },
});

export const selectQuery = (state: RootState) => state.discover.query;

export const selectTypes = (state: RootState) => state.discover.types;

export const selectSearchLocation = (state: RootState) =>
  state.discover.searchLocation;

export const selectCurrentLocation = (state: RootState) =>
  state.discover.currentLocation;

export const {setQuery, toggleType, setSearchLocation, setCurrentLocation} =
  discoverSlice.actions;

export default discoverSlice.reducer;
