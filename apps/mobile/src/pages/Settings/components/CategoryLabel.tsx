import {Label} from '@components';
import styled from 'styled-components/native';

export const CategoryLabel = styled(Label).attrs(() => ({
  appearance: 'secondary',
}))(({theme}) => ({
  backgroundColor: theme.colors.chartUnfilled,
  paddingLeft: 20,
  paddingTop: 20,
  paddingBottom: 10,
}));
