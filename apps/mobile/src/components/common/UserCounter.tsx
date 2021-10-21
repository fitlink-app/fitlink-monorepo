import {Label} from '@components';
import React from 'react';
import {ViewProps} from 'react-native';
import styled from 'styled-components/native';
import {Avatar} from './Avatar';

const AVATAR_SIZE = 16;

const Wrapper = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const AvatarContainer = styled.View({
  flexDirection: 'row',
});

interface UserCounterProps extends ViewProps {
  countTotal: number;
  avatars: string[];
}

export const UserCounter = ({
  countTotal,
  avatars,
  ...rest
}: UserCounterProps) => {
  const countUnshown = countTotal - avatars.length;

  const renderAvatars = () => (
    <AvatarContainer style={{width: (avatars.length - 1) * 10 + AVATAR_SIZE}}>
      {avatars.map((url, index) => (
        <Avatar
          {...{url}}
          key={url + index.toString()}
          size={AVATAR_SIZE}
          style={{
            left: index === 0 ? 0 : -index * 6,
          }}
        />
      ))}
    </AvatarContainer>
  );

  return countTotal ? (
    <Wrapper {...rest}>
      {renderAvatars()}
      {!!countUnshown && (
        <Label
          type={'caption'}
          appearance={'accentSecondary'}
          bold
          style={{fontSize: 10, marginLeft: 8}}>
          +{countUnshown}
        </Label>
      )}
    </Wrapper>
  ) : null;
};
