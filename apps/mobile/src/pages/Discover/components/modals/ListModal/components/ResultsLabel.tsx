import {Label} from '@components';
import React from 'react';
import {ViewStyle} from 'react-native';
import styled from 'styled-components/native';

const Container = styled.View({
  marginTop: 12,
  paddingVertical: 12,
  flexDirection: 'row',
  justifyContent: 'flex-start',
  borderBottomWidth: 0.5,
  borderColor: 'rgba(255,255,255,.15)',
});

const ActivitiesIcon = styled.Image({
  width: 24,
  height: 24,
});

export const ResultsLabel = ({
  text,
  contentContainerStyle,
}: {
  text: string;
  contentContainerStyle?: ViewStyle;
}) => {
  return (
    <Container style={contentContainerStyle}>
      <ActivitiesIcon source={require('../../../../../../../assets/images/icon/activities.png')} />
      <Label appearance={'accent'} style={{marginLeft: 12, fontSize: 15}}>{text}</Label>
    </Container>
  );
};
