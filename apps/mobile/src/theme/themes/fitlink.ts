import {
  Theme,
  ThemeFonts,
  ThemeColors,
  ThemeTypography,
} from 'styled-components';

const fonts: ThemeFonts = {
  regular: 'Lato-Regular',
  bold: 'Lato-Bold',
};

const colors: ThemeColors = {
  text: '#FFFFFF',
  secondaryText: '#939393',
  buttonText: '#232323',
  background: '#000000',
  surface: '#2e2e2e',
  surfaceDark: '#202020',
  separator: '#2e2e2e',
  accent: '#00e9d7',
  accentSecondary: '#939393',
  chartUnfilled: '#202020',
  danger: '#D32F2F',
  navbar: '#565656',
  card: '#181818',
};

const typography: ThemeTypography = {
  title: {
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.text,
  },
  subheading: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.secondaryText,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.secondaryText,
  },
  button: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.buttonText,
  },
  textButton: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  textInputValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
  },
};

const theme: Theme = {
  fonts,
  colors,
  typography,
};

export default theme;
