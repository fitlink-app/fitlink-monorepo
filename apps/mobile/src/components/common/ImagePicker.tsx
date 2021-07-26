import React from 'react';
import {Image, Keyboard, View, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {ImagePickerDialogResponse, useImagePicker} from '@hooks';
import {Icon, Label, TouchHandler} from '.';

const Wrapper = styled.View({
  height: 140,
  width: '100%',
  borderRadius: 10,
  overflow: 'hidden',
});

const EmptyButtonContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

interface ImagePickerProps {
  label?: string;
  imageSrc?: string;
  error?: string;
  iconSize?: number;
  onImagePicked: (imageSrc: ImagePickerDialogResponse) => void;
  onImageDeleted?: () => void;
  style?: ViewStyle;
  deleteButtonContainerStyle?: ViewStyle;
}

export const ImagePicker = (props: ImagePickerProps) => {
  const {
    label,
    imageSrc,
    onImagePicked,
    onImageDeleted,
    error,
    style,
    deleteButtonContainerStyle,
    iconSize = 50,
  } = props;
  const {openImagePicker} = useImagePicker();

  const {colors} = useTheme();

  const handleSelectImage = () => {
    Keyboard.dismiss();

    openImagePicker('Select Image', response => {
      onImagePicked(response);
    });
  };

  const renderNoImageButtonContent = () => {
    return (
      <EmptyButtonContainer>
        <Icon name={'camera'} size={iconSize} color={colors.accentSecondary} />
        {!!label && (
          <Label type={'body'} appearance={'primary'} style={{marginTop: 5}}>
            {label}
          </Label>
        )}
      </EmptyButtonContainer>
    );
  };

  const renderImageButtonContent = () => {
    return (
      <>
        <Image
          resizeMode={'cover'}
          source={{uri: imageSrc}}
          style={{flex: 1}}
        />

        {!!onImageDeleted && (
          <TouchHandler
            onPress={onImageDeleted}
            style={{
              position: 'absolute',
              right: 10,
              top: 10,
              ...deleteButtonContainerStyle,
            }}>
            <View
              style={{
                backgroundColor: '#eb4034A6',
                padding: 6,
                borderRadius: 99,
              }}>
              <Icon name={'trash'} size={14} color={'white'} />
            </View>
          </TouchHandler>
        )}
      </>
    );
  };

  return (
    <TouchHandler onPress={handleSelectImage}>
      <Wrapper
        style={{
          ...style,
          borderWidth: imageSrc ? (error ? 1 : 0) : 1,
          borderColor: error ? colors.danger : colors.accentSecondary,
        }}>
        {imageSrc ? renderImageButtonContent() : renderNoImageButtonContent()}
      </Wrapper>

      {error && (
        <Label
          style={{
            textAlign: 'center',
            marginTop: 10,
          }}
          appearance={'error'}>
          {error}
        </Label>
      )}
    </TouchHandler>
  );
};
