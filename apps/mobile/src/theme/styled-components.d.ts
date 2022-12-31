import 'styled-components';
declare module 'styled-components' {
  export type ThemeFonts = {
    regular: string;
    bold: string;
  };

  type ThemeColors = {
    /** Titles, subtitles, certaion touchables where we want to drive mild attention */
    text: string;

    /** Captions, certain touchables where we don't really want to drive attention */
    secondaryText: string;

    /** Text color used for filled buttons */
    buttonText: string;

    /** Main background color */
    background: string;

    /** Background color for elements containing content such as cards */
    surface: string;

    /** Darker background color for elements containing content such as cards */
    surfaceDark: string;

    /** Separator color used on dark backgrounds */
    separator: string;

    /** Buttons, highlighted text, used for elements where we want to drive attention */
    accent: string;

    /** Icon buttons, button checkbox, etc */
    accentSecondary: string;

    /** Unfilled part of progress bars */
    chartUnfilled: string;

    /** Error indicator, danger button color */
    danger: string;

    /** Bottom navigation bar background color */
    navbar: string;

    /** Card background color */
    card: string;
  };

  type ThemeTextStyle = {
    fontFamily?: string;
    fontSize?: number;
    color?: string;
  };

  type ThemeTypography = {
    title: ThemeTextStyle;
    subheading: ThemeTextStyle;
    body: ThemeTextStyle;
    caption: ThemeTextStyle;
    button: ThemeTextStyle;
    textButton: ThemeTextStyle;
    textInputValue: ThemeTextStyle;
  };

  interface Theme {
    fonts: ThemeFonts;
    colors: ThemeColors;
    typography: ThemeTypography;
  }

  export interface DefaultTheme extends Theme {}
}
