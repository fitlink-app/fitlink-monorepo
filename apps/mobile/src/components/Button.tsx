import React from 'react';
import {
  TouchableOpacityProps,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label} from './Label';
import {Icon} from './Icon';

const ButtonBase = styled(TouchableOpacity)({
  width: '100%',
});

const Row = styled.View({flexDirection: 'row'});

const ButtonContentContainer = styled.View(({theme: {colors}}) => ({
  borderRadius: 8,
  width: '100%',
  height: 44,
  paddingHorizontal: 24,
  justifyContent: 'center',
  alignItems: 'center',
}));

const ButtonLabel = styled(Label)({flex: 1, textAlign: 'center'});

type ButtonType = 'default' | 'danger';

export interface ButtonProps extends TouchableOpacityProps {
  text?: string;
  type?: ButtonType;
  textStyle?: StyleProp<TextStyle>;
  outline?: boolean;
  textOnly?: boolean;
  icon?: string;
  loading?: boolean;
}

export const Button = ({
  text,
  type = 'default',
  disabled,
  outline,
  textOnly,
  textStyle,
  icon,
  loading,
  ...rest
}: ButtonProps) => {
  const {typography, colors, fonts} = useTheme();

  const buttonMainColor = createButtonMainColor();

  function createButtonMainColor() {
    switch (type) {
      case 'danger':
        return colors.danger;

      default:
        return colors.accent;
    }
  }

  function createContainerStyle() {
    const additionalContainerStyles: ViewStyle[] = [
      {backgroundColor: buttonMainColor},
    ];

    if (disabled) {
      additionalContainerStyles.push({backgroundColor: colors.accentSecondary});
    }

    if (outline) {
      const enabledOutlineColor = buttonMainColor;
      const disabledOutlineColor = colors.accentSecondary;

      additionalContainerStyles.push({
        borderWidth: 1,
        borderColor: disabled ? disabledOutlineColor : enabledOutlineColor,
        backgroundColor: 'transparent',
      });
    }

    if (textOnly) {
      additionalContainerStyles.push({
        borderWidth: 0,
        backgroundColor: 'transparent',
      });
    }

    return additionalContainerStyles;
  }

  function createButtonTextColor() {
    let color = typography.button.color;

    if (disabled) {
      color = textOnly ? colors.accentSecondary : typography.button.color;
    } else {
      if (outline) {
        color = buttonMainColor;
      } else {
        switch (type) {
          case 'danger':
            color = textOnly ? colors.danger : 'white';
            break;

          default:
            color = textOnly ? 'white' : typography.button.color;
            break;
        }
      }
    }

    return color;
  }

  function createTextStyle() {
    let style: StyleProp<TextStyle> = {};

    if (textOnly) style = typography.textButton;

    return style;
  }

  const textColor = createButtonTextColor();

  return (
    <ButtonBase {...{...rest, disabled}}>
      <ButtonContentContainer style={createContainerStyle()}>
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Row>
            {!!icon && <Icon name={icon} size={18} color={textColor} />}

            <ButtonLabel
              numberOfLines={1}
              style={{
                ...typography.button,
                ...createTextStyle(),
                color: textColor,
                ...(textStyle as {}),
              }}>
              {text}
            </ButtonLabel>
          </Row>
        )}
      </ButtonContentContainer>
    </ButtonBase>
  );
};
