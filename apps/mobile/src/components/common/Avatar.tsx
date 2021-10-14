import React from 'react';
import styled from 'styled-components/native';
import {ImageProps} from 'react-native';

const defaultAvatar = require('../../../assets/images/default_avatar.jpg');
const defaultSize = 80;

const StyledImage = styled.Image<AvatarProps & ImageProps>(
  ({size = defaultSize}) => ({
    height: size,
    width: size,
    borderRadius: size * 2,
  }),
);

interface AvatarProps extends Omit<ImageProps, 'source'> {
  /** Will use default avatar if unset */
  url?: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = props => {
  const {url, ...rest} = props;
  return <StyledImage source={url ? {uri: url} : defaultAvatar} {...rest} />;
};
