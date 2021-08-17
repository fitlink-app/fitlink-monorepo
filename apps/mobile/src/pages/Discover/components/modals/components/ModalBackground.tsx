import styled from 'styled-components/native';
import {StyleSheet} from 'react-native';

export const ModalBackground = styled.View(({theme: {colors}}) => ({
  ...StyleSheet.absoluteFillObject,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  overflow: 'hidden',
  backgroundColor: colors.surface,
}));
