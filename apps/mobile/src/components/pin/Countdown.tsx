import React, {FC, useState} from 'react';
import styled from 'styled-components/native';

import theme from '@theme';
import {useInterval} from '@hooks';

const getTime = (timeLeft: number) => {
  const min = Math.floor((timeLeft / 1000 / 60) % 60);
  const sec = Math.floor((timeLeft / 1000) % 60);

  const displayMin = min < 10 ? `0${min}` : min;
  const displaySec = sec < 10 ? `0${sec}` : sec;

  return `00:${displayMin}:${displaySec}`;
};

interface CountdownProps {
  expiresAt: number;
}

export const Countdown: FC<CountdownProps> = ({expiresAt}) => {
  const [countdown, setCountdown] = useState(expiresAt - Date.now());

  useInterval(
    () => {
      setCountdown(expiresAt - Date.now());
    },
    countdown > 0 ? 250 : null,
  );

  return (
    <SWrapper>
      <SCountdown>{getTime(countdown)}</SCountdown>
      <SDescription>Cooldown. Try again later</SDescription>
    </SWrapper>
  );
};

const SWrapper = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

const SCountdown = styled.Text({
  fontSize: 50,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.accent,
});

const SDescription = styled.Text({
  fontSize: 16,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});
