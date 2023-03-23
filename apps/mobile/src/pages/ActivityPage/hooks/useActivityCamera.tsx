import React from 'react';
import {HealthActivity} from '@fitlink/api/src/modules/health-activities/entities/health-activity.entity';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {
  useHealthActivityImage,
  useImagePicker,
  useModal,
  useShareHealthActivity,
  useUploadImage,
} from '@hooks';
import {Alert} from 'react-native';
import {Dialog} from 'components/modal';
import {useDefaultOkSnackbar} from 'components/snackbar';

export const useActivityCamera = (
  data: HealthActivity | undefined,
  currentImageIndex: number,
) => {
  const {shareActivity, isLoading: isShareActivityLoading} =
    useShareHealthActivity();

  const {mutateAsync: uploadImage, isLoading: isUploadingImage} =
    useUploadImage();

  const {
    addImageMutation: {
      mutateAsync: addHealthActivityImage,
      isLoading: isAddingHealthActivityImage,
    },
    deleteImageMutation: {mutateAsync: deleteHealthActivityImage},
  } = useHealthActivityImage();

  const {openImagePicker} = useImagePicker();

  const {openModal, closeModal} = useModal();

  const showOkSnackbar = useDefaultOkSnackbar();

  const handleOnImagePickerPressed = () => {
    openImagePicker('Upload new image', async response => {
      try {
        const uploadResult = await uploadImage({
          image: response,
          type: ImageType.Cover,
        });
        await addHealthActivityImage({
          activityId: data!.id,
          images: [uploadResult.id],
        });
      } catch (e) {
        Alert.alert('Failed to upload image', "Oops! Something wen't wrong.");
      }
    });
  };

  const handleOnImageOptionsPressed = () => {
    if (!data) {
      return;
    }

    openModal(id => (
      <Dialog
        title={'Photo Options'}
        onCloseCallback={() => {
          closeModal(id);
        }}
        buttons={[
          {
            text: 'Delete Photo',
            type: 'danger',
            onPress: () => {
              deleteHealthActivityImage({
                activityId: data.id,
                imageId: data.images[currentImageIndex]?.id,
              });

              setTimeout(() => {
                showOkSnackbar('Photo deleted successfully!');
              }, 500);
            },
          },
        ]}
      />
    ));
  };

  const handleOnSharePressed = () => {
    if (!data) {
      return;
    }
    shareActivity({
      activityId: data?.id,
      imageId: data?.images ? data.images[currentImageIndex]?.id : undefined,
    });
  };
  return {
    handleOnSharePressed,
    handleOnImageOptionsPressed,
    handleOnImagePickerPressed,
    isShareActivityLoading,
    isUploadingImage,
    isAddingHealthActivityImage,
  };
};
