import {Label} from '@components';
import styled from 'styled-components/native';

export const SettingsItemLabel = styled(Label).attrs(
  ({accent}: {accent: boolean}) => ({
    type: 'subheading',
    appearance: accent ? 'accent' : 'primary',
  }),
)({});
