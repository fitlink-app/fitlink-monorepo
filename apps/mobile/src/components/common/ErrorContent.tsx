import React from 'react';
import {Text} from 'react-native';
import styled from 'styled-components/native';

import {FitButton} from '@components';

const SCenteredView = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const ErrorContent = ({onRefresh}: {onRefresh: () => unknown}) => (
  <SCenteredView>
    <Text>Something went wrong!</Text>
    <FitButton variant="primary" text="Refresh" onPress={onRefresh} />
  </SCenteredView>
);

export default ErrorContent;
