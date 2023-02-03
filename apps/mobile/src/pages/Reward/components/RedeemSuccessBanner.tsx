import React, {FC} from 'react';
import styled from 'styled-components/native';
import Clipboard from '@react-native-community/clipboard';

import {openUrl} from '@utils';
import {FitButton} from '@components';

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
    <Banner paragraphs={[instructions]}>
      <SLink onPress={openRewardUrl}>{url}</SLink>
      <SRow>
        <SText>{code}</SText>
        <FitButton
          onPress={copyCodeToClipboard}
          variant="primary"
          text="COPY"
          style={{marginLeft: 14}}
        />
      </SRow>
    </Banner>
  );
};

const SText = styled.Text({
  fontSize: 14,
  lineHeight: 18,
  fontWeight: 400,
  color: '#ACACAC',
  fontFamily: 'Roboto',
});

const SLink = styled.Text({
  fontSize: 14,
  lineHeight: 18,
  fontWeight: 400,
  color: '#0000EE',
  marginBottom: 20,
  fontFamily: 'Roboto',
});

const SRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
});
