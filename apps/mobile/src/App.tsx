import {AppBackground} from '@components';
import {AuthProvider} from 'contexts';
import {withQueryClient} from 'query/queryClient';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppBackground>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </AppBackground>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default withQueryClient(App);
