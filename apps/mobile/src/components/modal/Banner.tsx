import React, {FC, PropsWithChildren} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

import {Icon, Modal} from '@components';

import theme from '../../theme/themes/fitlink';

export interface IBannerProps {
  containerStyle?: StyleProp<ViewStyle>;
  title?: string;
  iconName?: string;
  iconSize?: number;
  iconColor?: string;
  paragraphs?: string[];
}

export const Banner: FC<PropsWithChildren<IBannerProps>> = ({
  title,
  iconName,
  children,
  paragraphs,
  containerStyle,
  iconSize = 24,
  iconColor = theme.colors.text,
}) => (
  <Modal
    containerStyle={[{paddingHorizontal: 20, paddingTop: 10}, containerStyle]}>
    {!!iconName && (
      <Icon
        style={{marginBottom: 30, alignSelf: 'center'}}
        color={iconColor}
        name={iconName}
        size={iconSize}
      />
    )}
    {!!title && <STitle>{title}</STitle>}
    {paragraphs?.map(p => (
      <SText>{p}</SText>
    ))}
    {children}
  </Modal>
);

const STitle = styled.Text({
  fontSize: 16,
  fontWeight: 500,
  marginBottom: 20,
  alignSelf: 'center',
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const SText = styled.Text({
  fontSize: 14,
  lineHeight: 18,
  fontWeight: 400,
  color: '#ACACAC',
  marginBottom: 20,
  fontFamily: 'Roboto',
});
