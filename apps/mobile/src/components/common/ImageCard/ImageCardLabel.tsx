import React, {ComponentProps} from 'react';
import styled from 'styled-components/native';
import theme from '../../../theme/themes/fitlink';
import {StyleProp, View, ViewStyle} from 'react-native';

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

type ImageCardLabelProps = ComponentProps<any> & {
  text: string;
  labelStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<ViewStyle>;
};

export const ImageCardLabel = ({
  text,
  labelStyle,
  textStyle,
}: ImageCardLabelProps) => (
  <View>
    <LabelContainer style={labelStyle}>
      <SText style={textStyle}>{text}</SText>
    </LabelContainer>
  </View>
);
