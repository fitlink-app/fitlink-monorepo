import React from 'react';
import {TextProps, Text, TextStyle, StyleProp} from 'react-native';
import {useTheme} from 'styled-components/native';

type LabelType = 'title' | 'subheading' | 'caption' | 'body';

type LabelAppearance =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'accentSecondary'
  | 'error'
  | 'black';

export interface LabelProps extends TextProps {
  type?: LabelType;
  appearance?: LabelAppearance;
  bold?: boolean;
  numberOfNumbers?: number;
}

export const
  Label: React.FC<LabelProps> = React.forwardRef(
  ({type = 'body', appearance, bold, style, ...rest}, ref: any) => {
    const {fonts, typography, colors} = useTheme();

    // Get base text style based on label type
    function createTypeStyle() {
      switch (type) {
        case 'title':
          return typography.title;

        case 'subheading':
          return typography.subheading;

        case 'caption':
          return typography.caption;

        default:
          return typography.body;
      }
    }

    function createTextColor() {
      switch (appearance) {
        case 'primary':
          return colors.text;

        case 'secondary':
          return colors.secondaryText;

        case 'accent':
          return colors.accent;

        case 'accentSecondary':
          return colors.accentSecondary;

        case 'error': {
          return colors.danger;
        }

        case 'black': {
          return colors.background;
        }

        default:
          return colors.text;
      }
    }

    const textStyles: StyleProp<TextStyle>[] = [
      createTypeStyle(),
      {color: createTextColor()},
      bold ? {fontWeight: '700'} : {},
      {fontFamily: fonts.bold},
      style,
    ];

    return <Text {...rest} ref={ref} style={textStyles} />;
  },
);
