import React from 'react';
import styled from 'styled-components/native';
import {Label} from '../';

const Wrapper = styled.View({});

const Error = styled(Label).attrs(() => ({
  appearance: 'error',
}))({
  textAlign: 'center',
  marginTop: 5,
});

interface FieldWrapperProps {
  error?: string;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  error,
  ...rest
}) => {
  return (
    <Wrapper {...rest}>
      {children}
      {!!error && <Error>{error}</Error>}
    </Wrapper>
  );
};
