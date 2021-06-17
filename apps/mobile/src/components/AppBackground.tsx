import styled from 'styled-components/native';

export const AppBackground = styled.View(({theme: {colors}}) => ({
  flex: 1,
  backgroundColor: colors.background,
}));
