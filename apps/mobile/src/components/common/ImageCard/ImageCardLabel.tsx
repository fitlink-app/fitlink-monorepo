import React, {FC} from 'react';
import { StyleProp, TextStyle, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native';

import theme from '../../../theme/themes/fitlink';

export const ImageCardLabel: FC<ImageCardLabelProps> = ({
  text,
  labelStyle,
  textStyle,
}) => (
  <View>
    <LabelContainer style={labelStyle}>
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

type ImageCardLabelProps = {
  text: string;
  labelStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};
