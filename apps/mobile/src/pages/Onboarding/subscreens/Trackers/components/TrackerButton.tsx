import {Button, ButtonProps, Icon, Label, TouchHandler} from '@components';
import React from 'react';
import {ActivityIndicator, StyleProp, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';

const ButtonWrapper = styled.View({padding: 5, minWidth: 180});

const IconHolder = styled.View({
  position: 'absolute',
  right: 10,
});

interface TrackerButtonProps extends ButtonProps {
  label: string;
  providerType: string;
}

export const TrackerButton = ({label, ...rest}: TrackerButtonProps) => {
  const {colors, typography} = useTheme();
  //   const { isLinked, isLoading, linkProvider } = useHealthProvider(providerType);
  const isLinked = false;
  const isLoading = false;

  const textStyle = {
    ...typography.button,
    color: isLinked ? colors.accent : colors.accentSecondary,
  };

  const buttonStyle: StyleProp<ViewStyle> = {
    borderColor: isLinked ? colors.accent : colors.accentSecondary,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
  };

  const renderIcon = () =>
    isLinked && (
      <IconHolder>
        <Icon name="link" size={14} color={colors.accent} />
      </IconHolder>
    );

  return (
    <ButtonWrapper key={label}>
      <TouchHandler outline disabled={isLinked} {...rest} style={buttonStyle}>
        <Label
          style={{...textStyle, textAlign: 'center', paddingHorizontal: 10}}>
          {label}
        </Label>

        {isLoading ? (
          <ActivityIndicator
            style={{position: 'absolute', right: 10}}
            size={'small'}
            color={isLinked ? colors.accent : colors.accentSecondary}
          />
        ) : (
          renderIcon()
        )}
      </TouchHandler>
    </ButtonWrapper>
  );
};
