import React from 'react';
import {Button, Card, Label, Navbar} from '@components';
import theme from '../../../theme/themes/fitlink';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/core';

const Wrapper = styled.View({
  paddingHorizontal: 10,
  paddingTop: 40,
});

const WalletCard = styled(Card)({
  borderRadius: 26,
  paddingTop: 32,
  paddingBottom: 41,
  alignItems: 'center',
  justifyContent: 'center',
});

const WalletLabel = styled(Label).attrs(() => ({
  type: 'title',
  appearance: 'accent',
  bold: true,
}))({
  marginLeft: 11,
});

const WalletNotConnectedContent = (): JSX.Element => {
  const navigation = useNavigation();

  return (
    <Wrapper>
      <WalletCard>
        <Navbar
          centerComponent={<WalletLabel>WALLET</WalletLabel>}
          iconColor={theme.colors.text}
        />
        <Label
          appearance={'secondary'}
          style={{
            marginTop: 80,
            fontSize: 18,
            lineHeight: 25,
            width: 227,
            textAlign: 'center',
          }}>
          Head over to settings to connect your wallet.
        </Label>
        <Button
          text={'SETTINGS'}
          textStyle={{
            fontSize: 14,
            marginLeft: 10,
          }}
          containerStyle={{
            borderRadius: 12,
            width: 184,
            marginTop: 18,
          }}
          logo={require('../../../assets/images/icon/settings.png')}
          onPress={() => {
            navigation.navigate('Settings');
          }}
        />
      </WalletCard>
    </Wrapper>
  );
};

export default WalletNotConnectedContent;
