import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import theme from '../../theme/themes/fitlink';

type FitButtonVariant =
  | 'primary'
  | 'primary-outlined'
  | 'secondary'
  | 'secondary-outlined';
type FitButtonProps = React.ComponentProps<typeof TouchableOpacity> & {
  variant: FitButtonVariant;
  text: string;
  textStyle?: StyleProp<TextStyle>;
};

type VariantStyles = {
  touchable: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
};

const getVariantStyles = (variant: FitButtonVariant): VariantStyles => {
  switch (variant) {
    case 'primary':
      return {
        touchable: {
          backgroundColor: theme.colors.accent,
        },
        text: {
          color: theme.colors.background,
        },
      };
    case 'primary-outlined':
      return {
        touchable: {
          borderWidth: 1,
          borderColor: theme.colors.accent,
          backgroundColor: 'transparent',
        },
        text: {
          color: theme.colors.accent,
        },
      };
    case 'secondary':
      return {
        touchable: {
          backgroundColor: theme.colors.text,
        },
        text: {
          color: theme.colors.background,
        },
      };
    case 'secondary-outlined':
      return {
        touchable: {
          borderWidth: 1,
          borderColor: theme.colors.text,
          backgroundColor: 'transparent',
        },
        text: {
          color: theme.colors.text,
        },
      };
  }
};

export const FitButton = ({
  style,
  variant,
  text,
  textStyle,
  ...rest
}: FitButtonProps): JSX.Element => {
  const variantStyle = getVariantStyles(variant);

  return (
    <TouchableOpacity
      {...rest}
      style={[buttonStyles.baseTouchable, variantStyle.touchable, style]}>
      <Text style={[buttonStyles.baseText, variantStyle.text, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  baseTouchable: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    flexShrink: 1,
  },
});
