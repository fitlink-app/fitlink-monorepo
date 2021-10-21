import React from 'react';
import {Icon, Label, TouchHandler} from '@components';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/core';

const BadgeWrapper = styled.View(({theme: {colors}}) => ({
  backgroundColor: colors.danger,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 99,
  height: 17,
  width: 18,
  position: 'absolute',
  left: 8,
  bottom: 10,
}));

const NotificationsButtonIcon = styled(Icon).attrs(({theme: {colors}}) => ({
  name: 'bell',
  size: 20,
  color: colors.accentSecondary,
}))({});

export const NotificationsButton = ({count}: {count: number}) => {
  const navigation = useNavigation();

  return (
    <TouchHandler
      onPress={() => {
        navigation.navigate('Notifications');
      }}>
      <NotificationsButtonIcon disabled />

      {!!count && (
        <BadgeWrapper>
          <Label type={'caption'} style={{color: 'white'}} bold>
            {Math.min(count, 99)}
          </Label>
        </BadgeWrapper>
      )}
    </TouchHandler>
  );
};
