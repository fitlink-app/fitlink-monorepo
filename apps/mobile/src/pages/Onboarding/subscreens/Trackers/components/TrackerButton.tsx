import {ButtonProps, Icon, Label, TouchHandler} from '@components';
import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {BfitSpinner} from '../../../../../components/common/BfitSpinner';

const ButtonWrapper = styled.View({padding: 5, minWidth: 180});

const IconHolder = styled.View({
  position: 'absolute',
  right: 10,
});

interface TrackerButtonProps extends ButtonProps {
  label: string;
  isLinked: boolean;
  isLoading: boolean;
}

export const TrackerButton = ({
  label,
  isLinked,
  isLoading,
  ...rest
}: TrackerButtonProps) => {
  const {colors, typography} = useTheme();

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
          <BfitSpinner
            wrapperStyle={styles.loadingWrapper}
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

const styles = StyleSheet.create({
  loadingWrapper: {
    position: 'absolute',
    right: 10,
  },
});
