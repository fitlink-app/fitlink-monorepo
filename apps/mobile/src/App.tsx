import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppBackground} from '@components';
import {withQueryClient} from '@query';
import {AuthProvider, ModalProvider} from './contexts';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
import {QueryPersistor} from 'query/QueryPersistor';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <AuthProvider>
            <QueryPersistor>
              <ModalProvider>
                <Router />
              </ModalProvider>
            </QueryPersistor>
          </AuthProvider>
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default withQueryClient(App);
