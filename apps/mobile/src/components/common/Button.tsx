import React from 'react';
import {ViewStyle, StyleProp, TextStyle, Image} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label} from './Label';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

const ButtonImage = styled(Image)({
  alignItems: 'center',
  width: 20,
  height: 20,
});

const Row = styled.View({
  position: 'absolute',
  flexDirection: 'row',
  alignItems: 'center',
});

const ButtonContentContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: 44,
  paddingHorizontal: 12,
  borderRadius: 8,
});

type ButtonType = 'default' | 'danger' | 'accent';

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
  logo?: any;
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
  loading,
  style,
  logo,
  ...rest
}: ButtonProps) => {
  const {typography, colors} = useTheme();

  const buttonMainColor = createButtonMainColor();

  function createButtonMainColor() {
    switch (type) {
      case 'danger':
        return colors.danger;

      case 'accent':
        return colors.accent;

      default:
        return colors.text;
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

    if (textOnly) {
      style = typography.textButton;
    }

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
          {!!logo && <ButtonImage source={logo} resizeMode={'contain'} />}
          {(!loading || loadingText) && (
            <Label
              numberOfLines={1}
              style={{
                ...typography.button,
                ...createTextStyle(),
                color: textColor,
                ...(textStyle as {}),
              }}>
              {loading ? (loadingText ? loadingText : text) : text}
            </Label>
          )}
        </Row>
      </ButtonContentContainer>
    </TouchHandler>
  );
};
