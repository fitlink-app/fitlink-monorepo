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
  | 'secondary-outlined'
  | 'google';

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
          paddingVertical: 8,
        },
        text: {
          color: theme.colors.background,
        },
      };
    case 'primary-outlined':
      return {
        touchable: {
          borderWidth: 2,
          paddingVertical: 6,
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
          paddingVertical: 8,
          backgroundColor: theme.colors.text,
        },
        text: {
          color: theme.colors.background,
        },
      };
    case 'secondary-outlined':
      return {
        touchable: {
          borderWidth: 2,
          paddingVertical: 10,
          borderColor: theme.colors.text,
          backgroundColor: 'transparent',
        },
        text: {
          color: theme.colors.text,
        },
      };
    case 'google':
      return {
        touchable: {
          borderRadius: 2,
          paddingVertical: 10,
          borderColor: '#fff',
          backgroundColor: '#fff',
        },
        text: {
          color: '#757575',
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
  const IconRenderController = () => {
    if (isLoading) {
      return <BfitSpinner />;
    }
    if (LeadingIcon) {
      return <LeadingIcon />;
    }
    return null;
  };

  return (
    <TouchableOpacity
      {...rest}
      style={[buttonStyles.baseTouchable, variantStyle.touchable, style]}
    >
      {(LeadingIcon || isLoading) && (
        <View style={{marginRight: 8}}>
          <IconRenderController />
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
    paddingHorizontal: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
  baseText: {
    fontFamily: 'Roboto',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
    alignSelf: 'center',
  },
});
