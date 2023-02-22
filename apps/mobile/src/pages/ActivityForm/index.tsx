import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import styled, {useTheme} from 'styled-components/native';
import {Platform, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from 'routes/types';
import {
  ImagePickerDialogResponse,
  useCreateActivity,
  useDeleteActivity,
  useEditActivity,
  useForm,
  useUploadImage,
} from '@hooks';
import {
  Accordion,
  Button,
  ImagePicker,
  InputField,
  Label,
  Navbar,
  NAVBAR_HEIGHT,
  KeyboardAvoidingView,
} from '@components';
import {CreateActivityDto} from '@fitlink/api/src/modules/activities/dto/create-activity.dto';
import {getErrors} from '@api';
import {UpdateActivityDto} from '@fitlink/api/src/modules/activities/dto/update-activity.dto';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {Image} from '../../../../api/src/modules/images/entities/image.entity';

const FieldSpacer = styled.View({marginTop: 15});

const Row = styled.View({flexDirection: 'row'});

const ButtonContainter = styled.View({
  marginTop: 40,
  marginBottom: 20,
});

const InputFieldLabel = styled(Label).attrs(() => ({
  appearance: 'accent',
}))({
  marginBottom: 10,
});

const CustomInputField = styled(InputField).attrs(() => ({
  borderNone: true,
}))({
  backgroundColor: 'rgba(172, 172, 172, 0.1)',
  borderRadius: 10,
});

type ActivityImagesState = {
  image?: Image;
  pickedImage?: ImagePickerDialogResponse;
};

export const ActivityForm = (
  props: StackScreenProps<RootStackParamList, 'ActivityForm'>,
) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const {geo, onSubmitCallback, onDelete, action, data} = props.route.params;

  const initialValues: Partial<CreateActivityDto> = {
    name: data?.name || '',
    description: data?.description || '',
    date: data?.date || '',
    organizer_name: data?.organizer_name || '',
    organizer_url: data?.organizer_url || '',
    organizer_telephone: data?.organizer_telephone || '',
    organizer_email: data?.organizer_email || '',
    organizer_image: data?.organizer_image?.id || '',
    cost: data?.cost || '',
  };

  const initialImages: ActivityImagesState[] = [];

  for (const image of data?.images || []) {
    initialImages.push({image});
  }

  // State
  const [activityImages, setActivityImages] =
    useState<ActivityImagesState[]>(initialImages);
  const [organizerImage, setOrganizerImage] =
    useState<ImagePickerDialogResponse>();

  // Form
  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
  } = useForm(initialValues);

  // Queries
  const {mutateAsync: createActivity} = useCreateActivity();

  const {mutateAsync: editActivity} = useEditActivity();

  const {mutateAsync: deleteActivity, isLoading: isDeleting} =
    useDeleteActivity();

  const {mutateAsync: uploadImage, isLoading: isImageUploading} =
    useUploadImage();

  const handleOnSubmitPressed = async () => {
    let activityImageIds: string[] = [];
    let organizerImageId: string;

    try {
      for (const activityImage of activityImages) {
        if (activityImage.pickedImage) {
          const result = await uploadImage({
            image: activityImage.pickedImage,
            type: ImageType.Cover,
          });

          activityImageIds.push(result.id);
        } else if (activityImage.image) {
          activityImageIds.push(activityImage.image.id);
        }
      }

      if (organizerImage) {
        const result = await uploadImage({
          image: organizerImage,
          type: ImageType.Avatar,
        });

        organizerImageId = result.id;
      }

      handleSubmit(() => submitForm({activityImageIds, organizerImageId}));
    } catch (e) {
      console.error(e);
    }
  };

  const submitForm = async ({
    activityImageIds,
    organizerImageId,
  }: {
    activityImageIds?: string[];
    organizerImageId?: string;
  }) => {
    try {
      const baseDto = {...values};

      baseDto.meeting_point = `${geo.lng},${geo.lat}`;
      baseDto.meeting_point_text = 'unknown';
      baseDto.images = (activityImageIds || []).join();
      baseDto.organizer_image = organizerImageId || data?.organizer_image?.id;

      if (baseDto.organizer_url?.length === 0)
        baseDto.organizer_url = undefined;

      if (baseDto.organizer_email?.length === 0)
        baseDto.organizer_email = undefined;

      if (baseDto.organizer_image?.length === 0)
        baseDto.organizer_image = undefined;

      const result =
        action === 'create'
          ? await createActivity(baseDto as CreateActivityDto)
          : await editActivity({
              id: data!.id,
              dto: baseDto as UpdateActivityDto,
            });

      if (result) {
        navigation.goBack();
        onSubmitCallback && onSubmitCallback();
      }
    } catch (e: any) {
      const requestErrors = getErrors(e);
      console.error(requestErrors);
      return requestErrors;
    }
  };

  const handleDelete = () => {
    if (!data) return;
    deleteActivity(data.id);
  };

  const handleOnNewActivityImagePicked = (image: ActivityImagesState) => {
    const newActivityImages = [...activityImages];
    newActivityImages.push(image);
    setActivityImages(newActivityImages);
  };

  const handleOnImageDeleted = (index: number) => {
    const newActivityImages = [...activityImages];
    newActivityImages.splice(index, 1);
    setActivityImages(newActivityImages);
  };

  const renderImagePickers = () => {
    return activityImages.map((image, index) => {
      const imageSrc = image.pickedImage
        ? image.pickedImage.uri
        : image.image?.url_640x360;

      return (
        <ImagePicker
          {...{imageSrc}}
          onImageDeleted={() => handleOnImageDeleted(index)}
          style={{marginBottom: 10}}
          label={'Add a new image for your activity'}
        />
      );
    });
  };

  return (
    <>
      <KeyboardAvoidingView enabled={Platform.OS === 'ios'}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: NAVBAR_HEIGHT + insets.top + 5,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}>
          <View style={{overflow: 'hidden'}}>
            <FieldSpacer>
              <InputFieldLabel>Title</InputFieldLabel>
              <CustomInputField
                placeholder={'Activity Title'}
                value={values.name}
                onChangeText={handleChange('name')}
                error={fieldErrors?.name}
              />
            </FieldSpacer>

            <FieldSpacer>
              <InputFieldLabel>Date or Frequency of Activity</InputFieldLabel>
              <CustomInputField
                placeholder={'E.G : "Weekly Sundays at 7 am"'}
                value={values.date}
                onChangeText={handleChange('date')}
                error={fieldErrors?.date}
              />
            </FieldSpacer>

            <FieldSpacer>
              <InputFieldLabel>Description</InputFieldLabel>
              <CustomInputField
                placeholder={'Describe the activity'}
                value={values.description}
                onChangeText={handleChange('description')}
                multiline={true}
                error={fieldErrors?.description}
              />
            </FieldSpacer>

            <FieldSpacer>
              {renderImagePickers()}
              <InputFieldLabel>Activity Image</InputFieldLabel>

              <Row style={{alignItems: 'center'}}>
                <ImagePicker
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: colors.accent,
                  }}
                  iconSize={25}
                  iconColor={'#000000'}
                  borderNone
                  onImagePicked={dialogResponse =>
                    handleOnNewActivityImagePicked({
                      pickedImage: dialogResponse,
                    })
                  }
                  error={fieldErrors?.images}
                />
                <Label appearance={'secondary'} style={{marginLeft: 16}}>
                  Add new image for your activity
                </Label>
              </Row>
            </FieldSpacer>

            <FieldSpacer>
              <Accordion
                title={'Organiser Details'}
                subtitle={'(Optional)'}
                style={{paddingVertical: 5}}>
                <>
                  <FieldSpacer>
                    <Row style={{alignItems: 'flex-end'}}>
                      <ImagePicker
                        deleteButtonContainerStyle={{top: 2, right: 2}}
                        style={{
                          width: 60,
                          height: 60,
                          backgroundColor: colors.accent,
                        }}
                        iconSize={25}
                        iconColor={'#000000'}
                        borderNone
                        imageSrc={
                          organizerImage
                            ? organizerImage.uri
                            : data?.organizer_image?.url_512x512
                        }
                        onImagePicked={imgResponse =>
                          setOrganizerImage(imgResponse)
                        }
                        onImageDeleted={() => {
                          setOrganizerImage(undefined);
                        }}
                      />

                      <View style={{paddingLeft: 15, flex: 1}}>
                        <Label style={{marginBottom: 10}}>Organiser Name</Label>
                        <CustomInputField
                          placeholder={'Company, group or individual'}
                          value={values.organizer_name}
                          onChangeText={handleChange('organizer_name')}
                          error={fieldErrors?.organizer_name}
                        />
                      </View>
                    </Row>
                  </FieldSpacer>

                  <FieldSpacer>
                    <InputFieldLabel>Organiser's E-mail</InputFieldLabel>
                    <CustomInputField
                      placeholder={"Organiser's E-mail"}
                      value={values.organizer_email}
                      onChangeText={handleChange('organizer_email')}
                      error={fieldErrors?.organizer_email}
                      keyboardType={'email-address'}
                    />
                  </FieldSpacer>

                  <FieldSpacer>
                    <InputFieldLabel>Organiser's Website</InputFieldLabel>
                    <CustomInputField
                      placeholder={"Organiser's Website"}
                      value={values.organizer_url}
                      onChangeText={handleChange('organizer_url')}
                      error={fieldErrors?.organizer_url}
                      keyboardType={'url'}
                    />
                  </FieldSpacer>

                  <FieldSpacer>
                    <InputFieldLabel>Organiser's Phone Number</InputFieldLabel>
                    <CustomInputField
                      placeholder={"Organiser's Phone Number"}
                      value={values.organizer_telephone}
                      onChangeText={handleChange('organizer_telephone')}
                      error={fieldErrors?.organizer_telephone}
                      keyboardType={'phone-pad'}
                    />
                  </FieldSpacer>
                </>
              </Accordion>
            </FieldSpacer>

            <ButtonContainter>
              <Button
                text={
                  isSubmitting
                    ? undefined
                    : action === 'create'
                    ? 'CREATE ACTIVITY'
                    : 'SAVE ACTIVITY'
                }
                textStyle={{
                  fontFamily: 'Roboto',
                  fontSize: 14,
                }}
                containerStyle={{
                  width: 160,
                }}
                onPress={handleOnSubmitPressed}
                disabled={isDeleting || isSubmitting || isImageUploading}
                loading={isSubmitting || isImageUploading}
              />
              {action === 'edit' && (
                <Button
                  outline
                  style={{marginTop: 10}}
                  type={'danger'}
                  textStyle={{
                    fontFamily: 'Roboto',
                    fontSize: 14,
                  }}
                  text={isDeleting ? undefined : 'DELETE ACTIVITY'}
                  onPress={handleDelete}
                  disabled={isDeleting || isSubmitting || isImageUploading}
                  loading={isDeleting}
                />
              )}
            </ButtonContainter>

            {errorMessage && (
              <ButtonContainter>
                <Label
                  style={{textAlign: 'center', color: colors.danger}}
                  type={'body'}>
                  {errorMessage}
                </Label>
              </ButtonContainter>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Navbar
        overlay
        title={action === 'edit' ? 'EDIT ACTIVITY' : 'CREATE ACTIVITY'}
        titleStyle={{
          fontSize: 15,
          letterSpacing: 1,
          color: colors.accent,
        }}
        iconColor={colors.text}
      />
    </>
  );
};
