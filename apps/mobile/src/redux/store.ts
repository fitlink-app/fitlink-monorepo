import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from 'react-redux';
import {persistStore, persistReducer} from 'redux-persist';
import {configureStore, Store} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import rootReducer, {RootState} from './reducer';

const persistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  whitelist: ['auth', 'feedPreferences', 'userPreferences'],
};

const persistedReducer = persistReducer<RootState>(
  persistConfig,
  rootReducer as any,
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

let persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = (): Store<RootState> => useStore<RootState>();

export {store, persistor};
