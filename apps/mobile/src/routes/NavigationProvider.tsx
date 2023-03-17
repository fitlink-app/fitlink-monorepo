import React, {FC} from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {navigationRef} from './router';
import {navigationTheme} from './theme';

export const NavigationProvider: FC = ({children}) => {
  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      {children}
    </NavigationContainer>
  );
};
