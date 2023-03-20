import {DefaultTheme} from '@react-navigation/native';

import theme from '@theme';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.colors.background,
  },
};
