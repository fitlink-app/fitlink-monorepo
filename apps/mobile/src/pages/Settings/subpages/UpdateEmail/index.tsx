import {Navbar, NAVBAR_HEIGHT} from '@components';
import React from 'react';
import {ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {UpdateEmailForm} from './components';

const Wrapper = styled.View({flex: 1});

export const UpdateEmail = () => {
  const insets = useSafeAreaInsets();

  return (
    <Wrapper>
      <Navbar title="Update E-mail Address" overlay />

      <ScrollView
        bounces={false}
        contentContainerStyle={{
          marginTop: NAVBAR_HEIGHT + insets.top,
          paddingBottom: NAVBAR_HEIGHT + insets.top + insets.bottom + 20,
          padding: 20,
        }}>
        <UpdateEmailForm />
      </ScrollView>
    </Wrapper>
  );
};
