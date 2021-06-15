import styled from 'styled-components/native';

export const Card: React.FC = styled.View(({theme}) => ({
  borderRadius: 15,
  backgroundColor: theme.colors.surface,
  boxShadow: '5px 5px 4px rgba(0, 0, 0, .1)',
  elevation: '2',
}));