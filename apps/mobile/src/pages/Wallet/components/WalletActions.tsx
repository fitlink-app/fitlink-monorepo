import React, {FC} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, Label} from '@components';
import styled from 'styled-components/native';
import theme from '../../../theme/themes/fitlink';

const ButtonGroup = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  alignSelf: 'center',
  marginTop: 28,
  width: 300,
});

const IconWrapper = styled.View({
  width: 68,
  height: 68,
  borderRadius: 999,
  borderWidth: 2,
  borderColor: '#FFFFFF',
  justifyContent: 'center',
  alignItems: 'center',
});

interface ActionButtonProps {
  onPress: () => unknown;
  iconName: string;
  label: string;
}

const ActionButton: FC<ActionButtonProps> = ({onPress, iconName, label}) => (
  <View>
    <TouchableOpacity onPress={onPress}>
      <IconWrapper>
        <Icon name={iconName} size={20} color={theme.colors.accent} />
      </IconWrapper>
    </TouchableOpacity>
    <Label style={actionStyles.label}>{label}</Label>
  </View>
);

const actionStyles = StyleSheet.create({
  label: {alignSelf: 'center', marginTop: 16},
});

interface WalletActionsProps {
  onBuy: () => unknown;
  onSell: () => unknown;
  onStock: () => unknown;
}

export const WalletActions: FC<WalletActionsProps> = ({
  onBuy,
  onSell,
  onStock,
}) => {
  return (
    <ButtonGroup>
      <ActionButton onPress={onBuy} iconName="plus" label="BUY" />
      <ActionButton onPress={onSell} iconName="plus" label="SELL" />
      <ActionButton onPress={onStock} iconName="plus" label="STOCK" />
    </ButtonGroup>
  );
};

export default WalletActions;
