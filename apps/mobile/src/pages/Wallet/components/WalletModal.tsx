import React from 'react';
import {Icon, Modal} from '@components';
import theme from '../../../theme/themes/fitlink';
import styled from 'styled-components/native';

const SModalText = styled.Text({
  fontFamily: 'Roboto',
  color: '#ACACAC',
  fontSize: 14,
  lineHeight: 20,
  marginBottom: 20,
});

const SModalIconWrapper = styled.View({
  alignSelf: 'center',
  marginBottom: 30,
});

const STitle = styled.Text({
  color: theme.colors.text,
  fontFamily: 'Roboto',
  fontSize: 16,
  lineHeight: 20,
  fontWeight: 500,
  marginBottom: 4,
});

const Info = () => (
  <Modal>
    <SModalIconWrapper>
      <Icon name="info" color={theme.colors.text} size={24} />
    </SModalIconWrapper>
    <SModalText>
      The fiat value displayed here is based on our target listing price of 1
      $BFIT = $0.20
    </SModalText>
    <SModalText>
      Please note that this target price could change after TGE
    </SModalText>
  </Modal>
);

const ComingSoon = () => (
  <Modal>
    <SModalIconWrapper>
      <STitle>Coming Soon</STitle>
    </SModalIconWrapper>
    <SModalText>
      The ability to Buy, Sell and Stake your $BFIT is coming soon.
    </SModalText>
    <SModalText>
      For now, keep competing and earning to build up your $BFIT.
    </SModalText>
    <SModalText>We’ll alert you when this feature is live.</SModalText>
    <SModalText>Thank you</SModalText>
  </Modal>
);

export default Object.assign(
  {},
  {
    Info,
    ComingSoon,
  },
);
