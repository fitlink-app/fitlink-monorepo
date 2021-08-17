import {Label} from '@components';
import React from 'react';
import {ViewStyle} from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View(({theme: {colors}}) => ({
  marginVertical: 8,
  paddingVertical: 12,
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomWidth: 0.5,
  borderColor: 'rgba(255,255,255,.15)',
}));

export const ResultsLabel = ({
  text,
  contentContainerStyle,
}: {
  text: string;
  contentContainerStyle?: ViewStyle;
}) => {
  return (
    <Container style={contentContainerStyle}>
      <Label appearance={'primary'}>{text}</Label>
    </Container>
  );
};
