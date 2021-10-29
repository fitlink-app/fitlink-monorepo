import React from 'react';
import {
  ViewStyle,
  ActivityIndicator,
  StyleProp,
  TextStyle,
  View,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label} from './Label';
import {Icon} from './Icon';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

const ButtonLabel = styled(Label)({textAlign: 'center'});

const Row = styled.View({
  flexDirection: 'row',
});

const ButtonContentContainer = styled.View(() => ({
  borderRadius: 8,
  height: 44,
  paddingHorizontal: 24,
  justifyContent: 'center',
  width: '100%',
  alignItems: 'center',
}));

const IconContainer = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  width: 20,
  height: 20,
});

type ButtonType = 'default' | 'danger';

export interface ButtonProps extends TouchHandlerProps {
  text?: string;
  loadingText?: string;
  type?: ButtonType;
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  outline?: boolean;
  wrapContent?: boolean;
  textOnly?: boolean;
  icon?: string;
  loading?: boolean;
}

export const Button = ({
  text,
  loadingText,
  type = 'default',
  disabled,
  outline,
  wrapContent,
  textOnly,
  textStyle,
  containerStyle,
  icon,
  loading,
  style,
  ...rest
}: ButtonProps) => {
  const {typography, colors} = useTheme();

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
        width: undefined,
      });
    }

    if (!wrapContent) {
      additionalContainerStyles.push({width: '100%', alignItems: 'center'});
    }

    if (containerStyle) {
      additionalContainerStyles.push(containerStyle as ViewStyle);
    }

    return additionalContainerStyles;
  }

  function createButtonTextColor() {
    let color = typography.button.color;

    if (disabled) {
      color =
        textOnly || outline ? colors.accentSecondary : typography.button.color;
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
    let style: StyleProp<TextStyle> = wrapContent ? {} : {flex: 1};

    if (textOnly) style = typography.textButton;

    return style;
  }

  const textColor = createButtonTextColor();

  const buttonBaseStyleModifier: StyleProp<ViewStyle> = {
    width: textOnly || wrapContent ? undefined : '100%',
    alignItems: 'center',
  };

  return (
    <TouchHandler
      {...{...rest, disabled}}
      style={[style, buttonBaseStyleModifier]}>
      <ButtonContentContainer style={createContainerStyle()}>
        <Row>
          {!!icon && !loading && (
            <IconContainer>
              <Icon name={icon} size={18} color={textColor} />
            </IconContainer>
          )}
          {loading && !loadingText && (
            <IconContainer>
              <ActivityIndicator color={textColor} />
            </IconContainer>
          )}
          {(!loading || loadingText) && (
            <ButtonLabel
              numberOfLines={1}
              style={{
                ...typography.button,
                ...createTextStyle(),
                color: textColor,
                ...(textStyle as {}),
              }}>
              {loading ? (loadingText ? loadingText : text) : text}
            </ButtonLabel>
          )}
        </Row>
      </ButtonContentContainer>
    </TouchHandler>
  );
};
