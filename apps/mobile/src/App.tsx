import React from 'react';
import {SafeAreaView} from 'react-native';

import Router from './routes/router';
import ThemeProvider from './theme/ThemeProvider';
const App = () => {
  return (
    <ThemeProvider>
      <SafeAreaView>
        <Router />
      </SafeAreaView>
    </ThemeProvider>
  );
};

export default App;
