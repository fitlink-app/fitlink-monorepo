import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground} from '@components';
import {withQueryClient} from '@query';
import {ModalProvider, Transition} from './contexts';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {Platform, UIManager} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {persistor, store} from 'redux/store';
import RNBootSplash from 'react-native-bootsplash';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibHVrZS1maXRsaW5rYXBwIiwiYSI6ImNrbzBhOHVpeDA5Y2gyd253MncxOGxoZjgifQ.Vyr2eDUhaZgR1VFoLaatbA',
);

const App = () => {
  useEffect(() => {
    setTimeout(() => {
      RNBootSplash.hide();
    }, 1000);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <Provider store={store}>
            <PersistGate persistor={persistor}>
              <Transition>
                <ModalProvider>
                  <QueryPersistor>
                    <Router />
                  </QueryPersistor>
                </ModalProvider>
              </Transition>
            </PersistGate>
          </Provider>
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default withQueryClient(App);
