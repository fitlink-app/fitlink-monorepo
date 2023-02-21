import React, {FC} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import theme from '../../theme/themes/fitlink';
import {BfitSpinner} from './BfitSpinner';

type BFitButtonVariant =
  | 'primary'
  | 'primary-outlined'
  | 'secondary'
  | 'secondary-outlined';
type BFitButtonProps = React.ComponentProps<typeof TouchableOpacity> & {
  variant: BFitButtonVariant;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean;
  LeadingIcon?: FC;
};

type VariantStyles = {
  touchable: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
};

const getVariantStyles = (variant: BFitButtonVariant): VariantStyles => {
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

export const BfitButton = ({
  style,
  variant,
  text,
  textStyle,
  LeadingIcon,
  isLoading,
  ...rest
}: BFitButtonProps): JSX.Element => {
  const variantStyle = getVariantStyles(variant);
  const Icon = isLoading ? BfitSpinner : LeadingIcon;

  return (
    <TouchableOpacity
      {...rest}
      style={[buttonStyles.baseTouchable, variantStyle.touchable, style]}>
      {Icon && (
        <View style={{marginRight: 8}}>
          <Icon />
        </View>
      )}
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
    flexDirection: 'row',
  },
  baseText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16,
    flexShrink: 1,
    alignSelf: 'center',
  },
});
