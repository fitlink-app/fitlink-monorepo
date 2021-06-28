import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground} from '@components';
import {withQueryClient} from '@query';
import {AuthProvider, ModalProvider} from './contexts';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';
import {Platform, UIManager} from 'react-native';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <ModalProvider>
            <AuthProvider>
              <QueryPersistor>
                <Router />
              </QueryPersistor>
            </AuthProvider>
          </ModalProvider>
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default withQueryClient(App);
