import React from 'react';
import styled from 'styled-components/native';
import {useTheme} from 'styled-components/native';
import {Keyboard} from 'react-native';
import {ImagePickerDialogResponse, useImagePicker} from '@hooks';
import {Icon, TouchHandler, Label} from '@components';

interface AvatarPickerProps {
  // Image URL if exists
  url?: string;

  // Callback
  onImagePicked: (imageSrc: ImagePickerDialogResponse) => void;
}

export const AvatarPicker = ({url, onImagePicked}: AvatarPickerProps) => {
  const {openImagePicker} = useImagePicker();

  const handlePickImage = () => {
    Keyboard.dismiss();

    openImagePicker('Edit Profile Picture', response => {
      onImagePicked(response);
    });
  };

  const {colors} = useTheme();

  const Wrapper = styled.View({alignItems: 'center'});

  // Style shared between picker and image
  const sharedStyle = {
    height: 124,
    width: 124,
    borderRadius: 62,
  };

  const ContentWrapper = styled.View({
    ...sharedStyle,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderColor: colors.accentSecondary,
    borderWidth: url ? 0 : 1,
    margin: 20,
  });

  const Image = styled.Image({
    ...sharedStyle,
  });

  return (
    <Wrapper>
      <Label type="title">Select a profile picture</Label>
      <TouchHandler onPress={handlePickImage}>
        <ContentWrapper>
          {url ? (
            <Image resizeMode={'cover'} source={{uri: url}} />
          ) : (
            <Icon name="camera" size={41} color={colors.accentSecondary} />
          )}
        </ContentWrapper>
      </TouchHandler>
    </Wrapper>
  );
};
