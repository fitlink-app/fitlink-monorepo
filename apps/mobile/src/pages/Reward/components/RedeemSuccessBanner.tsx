import React, {FC} from 'react';
import styled from 'styled-components/native';
import Clipboard from '@react-native-community/clipboard';

import {openUrl} from '@utils';
import {BfitButton} from '@components';

import {Banner} from '../../../components/modal';

interface IRedeemSuccessBannerProps {
  instructions: string;
  url: string;
  code: string;
}

export const RedeemSuccessBanner: FC<IRedeemSuccessBannerProps> = ({
  instructions,
  url,
  code,
}) => {
  const openRewardUrl = () => {
    openUrl(url);
  };

  const copyCodeToClipboard = () => {
    Clipboard.setString(code);
  };

  return (
    <Banner title="Reward redeemed" paragraphs={[instructions]}>
      <SText>CODE: {code}</SText>
      <SRow>
        <BfitButton
          onPress={copyCodeToClipboard}
          variant="primary"
          text="COPY CODE"
        />
        <BfitButton
          onPress={openRewardUrl}
          variant="secondary"
          text="VISIT WEBSITE"
        />
      </SRow>
    </Banner>
  );
};

const SText = styled.Text({
  fontSize: 22,
  fontWeight: 400,
  color: '#ACACAC',
  fontFamily: 'Roboto',
  textAlign: 'center',
  marginBottom: 30,
});

const SRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 20,
});
