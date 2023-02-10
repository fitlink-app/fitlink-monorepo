import React from 'react';
import styled from 'styled-components/native';
import type {ViewProps} from 'react-native';

const Wrapper = styled.View({
  width: '100%',
});

const ContentContainer = styled.View(() => ({
  minHeight: 50,
  marginHorizontal: 20,
  justifyContent: 'center',
}));

export const SettingsItemWrapper: React.FC<ViewProps> = props => {
  const {children, ...rest} = props;
  return (
    <Wrapper>
      <ContentContainer {...rest}>{children}</ContentContainer>
    </Wrapper>
  );
};
