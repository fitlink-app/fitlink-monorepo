import {Label, Navbar, NAVBAR_HEIGHT} from '@components';
import React from 'react';
import {FlatList} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {Notification} from './components';

const Wrapper = styled.View({flex: 1});

export const Notifications = () => {
  const insets = useSafeAreaInsets();
  const data = [1, 2, 3, 4];

  const renderItem = () => {
    // make this a separate component
    return <Notification />;
  };

  return (
    <Wrapper>
      <Navbar overlay title={'Notifications'} />

      <FlatList
        {...{data, renderItem}}
        contentContainerStyle={{
          paddingTop: NAVBAR_HEIGHT + insets.top,
          paddingBottom: insets.bottom + 20,
        }}
      />
    </Wrapper>
  );
};
