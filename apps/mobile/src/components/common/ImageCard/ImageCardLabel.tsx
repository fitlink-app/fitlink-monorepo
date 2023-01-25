import React, {ComponentProps} from 'react';
import styled from 'styled-components/native';
import theme from '../../../theme/themes/fitlink';

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

const SText = styled.Text({
  fontSize: 14,
  lineHeight: 16,
  fontWeight: 500,
  textAlign: 'center',
  fontFamily: 'Roboto',
  textTransform: 'uppercase',
  color: theme.colors.text,
});

type ImageCardLabelProps = ComponentProps<typeof Row> & {
  text: string;
};

export const ImageCardLabel = ({text, ...props}: ImageCardLabelProps) => (
  <Row {...props}>
    <LabelContainer>
      <SText>{text}</SText>
    </LabelContainer>
  </Row>
);
