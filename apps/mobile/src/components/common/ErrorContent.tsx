import React, {FC} from 'react';
import {ImageBackground} from 'react-native';
import styled from 'styled-components/native';

import {BfitButton} from '@components';

import theme from '../../theme/themes/fitlink';

const bg = require('../../../assets/images/dead-end.jpg');

interface IErrorContentProps {
  onRefresh: () => unknown;
  isRefreshing?: boolean;
}

export const ErrorContent: FC<IErrorContentProps> = ({
  onRefresh,
  isRefreshing = false,
}) => (
  <ImageBackground style={{flex: 1, justifyContent: 'flex-end'}} source={bg}>
    <SContent>
      <STitle>You caught us at a bad time!</STitle>
      <SText>
        Looks like something went wrong so hit the refresh button below to fix
        it.
      </SText>
      <BfitButton
        style={{alignSelf: 'center'}}
        disabled={isRefreshing}
        onPress={onRefresh}
        variant="primary"
        text={isRefreshing ? 'REFRESH...' : 'REFRESH'}
      />
    </SContent>
  </ImageBackground>
);

const STitle = styled.Text({
  fontSize: 18,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  marginBottom: 14,
});

const SText = styled.Text({
  fontSize: 14,
  fontWeight: 400,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  marginBottom: 24,
  textAlign: 'center',
});

const SContent = styled.View({
  marginBottom: 90,
  justifyContent: 'center',
  alignItems: 'center',
  marginHorizontal: 80,
});

export default ErrorContent;
