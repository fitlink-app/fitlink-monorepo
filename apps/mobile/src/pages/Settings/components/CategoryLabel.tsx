import {Label} from '@components';
import styled from 'styled-components/native';

export const CategoryLabel = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
}))(() => ({
  paddingLeft: 20,
  paddingVertical: 20,
}));
