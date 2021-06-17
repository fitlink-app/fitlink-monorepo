import React from 'react';
import {ThemeProvider} from 'styled-components/native';
import theme from './themes/fitlink';

const provider = ({children}: {children: React.ReactNode}) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

export default provider;
