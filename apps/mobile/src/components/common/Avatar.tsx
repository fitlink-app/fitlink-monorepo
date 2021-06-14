import React from 'react';
import styled from 'styled-components/native';
import {ImageSourcePropType, ImageProps} from 'react-native';

const defaultAvatar = require('../../../assets/images/default_avatar.jpg');

const StyledImage = styled.Image<AvatarProps & ImageProps>(({size}) => ({
  height: size,
  width: size,
  borderRadius: size * 2,
}));

interface AvatarProps extends Omit<ImageProps, 'source'> {
  /** Will use default avatar if unset */
  source?: ImageSourcePropType;
  size: number;
}

export const Avatar: React.FC<AvatarProps> = props => {
  const {source = defaultAvatar, ...rest} = props;
  return <StyledImage source={source} {...rest} />;
};
