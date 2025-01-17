import React from 'react';
import {Label, TouchHandler} from '@components';
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

const NotificationsButtonIcon = styled.Image({});

export const NotificationsButton = ({count}: {count: number}) => {
  const navigation = useNavigation();

  return (
    <TouchHandler
      hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
      onPress={() => {
        navigation.navigate('Notifications');
      }}>
      <NotificationsButtonIcon
        source={require('../../../assets/images/icon/bell.png')}
      />

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
