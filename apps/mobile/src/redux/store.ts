import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer, {RootState} from './reducer';

const persistConfig = {
  key: 'primary',
  storage: AsyncStorage,
  whitelist: ['auth', 'feedPreferences'],
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

export {store, persistor};
