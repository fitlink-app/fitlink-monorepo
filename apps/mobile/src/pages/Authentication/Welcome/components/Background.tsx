import React from 'react';
import styled from 'styled-components/native';

const BACKGROUND_IMAGE = require('../../../assets/images/Background.png');
const BACKGROUND_IMAGE_INVITED = require('../../../assets/images/Background-2.png');

const BackgroundContainer = styled.View({
  position: 'absolute',
  alignItems: 'flex-end',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  zIndex: -1,
});

const BackgroundImage = styled.Image({
  right: -130,
  bottom: -20,
});

interface BackgroundProps {
  /** Show "invited by" background variant in case the user is invited by someone */
  isInvitationalBackground?: boolean;
}

export const Background = ({isInvitationalBackground}: BackgroundProps) => {
  const imageSource = isInvitationalBackground
    ? BACKGROUND_IMAGE_INVITED
    : BACKGROUND_IMAGE;

  return (
    <BackgroundContainer>
      <BackgroundImage source={imageSource} />
    </BackgroundContainer>
  );
};
