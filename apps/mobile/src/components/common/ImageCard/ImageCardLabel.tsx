import React, {FC} from 'react';
import {StyleProp, TextStyle, View, ViewProps, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

import theme from '../../../theme/themes/fitlink';

interface ImageCardLabelProps extends Pick<ViewProps, 'onLayout'> {
  text: string;
  labelStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ImageCardLabel: FC<ImageCardLabelProps> = ({
  text,
  labelStyle,
  textStyle,
  onLayout,
}) => (
  <View>
    <LabelContainer style={labelStyle} onLayout={onLayout}>
      <SText style={textStyle}>{text}</SText>
    </LabelContainer>
  </View>
);

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
