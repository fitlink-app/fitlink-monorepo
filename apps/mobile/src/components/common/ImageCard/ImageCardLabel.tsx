import React, {ComponentProps} from 'react';
import styled from 'styled-components/native';
import {Label} from '../Label';

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const LabelContainer = styled.View({
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderRadius: 20,
  backgroundColor: '#060606',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const LabelText = styled(Label).attrs(() => ({
  type: 'body',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
  textAlign: 'center',
});

type ImageCardLabelProps = ComponentProps<typeof Row> & {
  text: string;
};

export const ImageCardLabel = ({text, ...props}: ImageCardLabelProps) => (
  <Row {...props}>
    <LabelContainer>
      <LabelText>{text}</LabelText>
    </LabelContainer>
  </Row>
);
