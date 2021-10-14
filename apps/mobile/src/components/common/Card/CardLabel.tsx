import styled from 'styled-components/native';

export const CardLabel = styled.Text(({theme}) => ({
  fontFamily: theme.fonts.bold,
  fontSize: 12,
  color: theme.colors.text,
}));
