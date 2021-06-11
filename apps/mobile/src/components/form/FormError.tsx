import styled from 'styled-components/native';
import {Label} from '../Label';

export const FormError = styled(Label).attrs(() => ({
  appearance: 'error',
}))({
  marginTop: 10,
  marginBottom: -5,
  textAlign: 'center',
});
