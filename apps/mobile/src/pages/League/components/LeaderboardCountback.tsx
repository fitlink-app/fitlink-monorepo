import {Label} from '@components';
import {getTimeRemaining} from '@utils';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import theme from '../../../theme/themes/fitlink';

const ResetText = styled(Label).attrs(() => ({
  type: 'caption',
}))<{color: string}>(({color}) => ({
  fontSize: 14,
  lineHeight: 19,
  letterSpacing: 1,
  textTransform: 'uppercase',
  fontFamily: theme.fonts.regular,
  color,
}));

interface CountbackProps {
  date: Date;
  repeat: boolean;
  color?: string;
}

export const LeaderboardCountback = ({
  date,
  repeat,
  color = '#ACACAC',
}: CountbackProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    updateTimeRemaining();

    const interval = setInterval(() => {
      updateTimeRemaining(interval);
    }, 1000 * 30);
    return () => clearInterval(interval);
  }, [date]);

  function updateTimeRemaining(interval?: NodeJS.Timeout) {
    const timeRemaining = getTimeRemainingString(date);

    timeRemaining
      ? setTimeRemaining(timeRemaining)
      : interval && clearInterval(interval);
  }

  function getTimeRemainingString(date: Date): string | null {
    const countdownTime = getTimeRemaining(date);

    /** If date is reached, return null and clear the interval */
    if (countdownTime === 0) {
      return repeat ? 'resets in 1 day' : 'ended';
    }
    const daysLeft = countdownTime.d || 1; // leaderboards update tasks run every 12 hour so we can't be more accurate with this

    let displayString = `${daysLeft} day${daysLeft === 1 ? '' : 's'}`;

    return (repeat ? 'resets in ' : 'ends in ') + displayString;
  }

  if (!date) {
    return null;
  }

  return <ResetText color={color}>{timeRemaining}</ResetText>;
};
