import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground} from '@components';
import {withQueryClient} from '@query';
import {ModalProvider} from './contexts';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {Platform, UIManager} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {persistor, store} from 'redux/store';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhOHVpeDA5Y2gyd253MncxOGxoZjgifQ.Vyr2eDUhaZgR1VFoLaatbA',
);

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <Provider store={store}>
            <PersistGate persistor={persistor}>
              <ModalProvider>
                <QueryPersistor>
                  <Router />
                </QueryPersistor>
              </ModalProvider>
            </PersistGate>
          </Provider>
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default withQueryClient(App);
