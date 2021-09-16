import {useModal} from '@hooks';
import {Dialog} from 'components/modal/Dialog';
import React from 'react';
import {
  CameraOptions,
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

export interface ImagePickerDialogResponse {
  uri: string;
  type: string;
  fileName: string;
}

type ImagePickerCallback = (response: ImagePickerDialogResponse) => void;

export function useImagePicker() {
  const {openModal, closeModal} = useModal();

  function openImagePicker(title: string, callback: ImagePickerCallback) {
    openModal(id => (
      <Dialog
        {...{title}}
        onCloseCallback={() => closeModal(id)}
        buttons={[
          {
            label: 'Take Picture',
            closeWithoutAnimation: true,
            onPress: () => openCamera(callback),
          },
          {
            label: 'Select From Gallery',
            closeWithoutAnimation: true,
            onPress: () => openGallery(callback),
          },
        ]}
      />
    ));
  }

  function openCamera(callback: ImagePickerCallback) {
    const pickerOptions = {
      mediaType: 'photo',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 1,
    } as CameraOptions;

    launchCamera(pickerOptions, response => {
      const handledResponse = handlePickerResponse(response);
      if (handledResponse) callback(handledResponse);
    });
  }

  function openGallery(callback: ImagePickerCallback) {
    const pickerOptions = {
      mediaType: 'photo',
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 1,
    } as CameraOptions;

    launchImageLibrary(pickerOptions, response => {
      const handledResponse = handlePickerResponse(response);
      if (handledResponse) callback(handledResponse);
    });
  }

  function handlePickerResponse(response: ImagePickerResponse) {
    const {didCancel, errorCode, assets} = response;
    const {uri, type, fileName} = (assets || [])[0];
    if (didCancel || errorCode || !uri || !type || !fileName) return;

    return {uri, type, fileName} as ImagePickerDialogResponse;
  }

  return {openImagePicker};
}
