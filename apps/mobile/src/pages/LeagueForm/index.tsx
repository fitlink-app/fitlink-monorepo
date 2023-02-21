import React, {useState, useEffect} from 'react';
import {Alert, Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {StackActions, useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';

import {
  Button,
  Checkbox,
  FormDropdown,
  InputField,
  Navbar,
  ImagePicker,
  NAVBAR_HEIGHT,
  FormError,
  Modal,
  KeyboardAvoidingView,
} from '@components';
import {
  ImagePickerDialogResponse,
  useCreateLeague,
  useDeleteLeague,
  useEditLeague,
  useForm,
  useModal,
  useSports,
  useUploadImage,
} from '@hooks';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {LeaguePublic} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {CreateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/create-league.dto';
import {getErrors} from '@api';
import {BfitSpinner} from '@components';

import {RootStackParamList} from 'routes/types';

type LeagueFormMode = 'edit' | 'create';

const leagueDurations = [
  {
    label: '1 week',
    value: 7,
  },
  {
    label: '2 weeks',
    value: 14,
  },
  {
    label: '3 weeks',
    value: 21,
  },
  {
    label: '4 weeks',
    value: 28,
  },
];

const FormContentWrapper = styled.View({flex: 1, marginBottom: 40});

const StyledInputField = styled(InputField)({
  marginBottom: 10,
});

const DropdownContainer = styled.View({
  flexDirection: 'row',
  width: '100%',
  marginBottom: 20,
  ...(Platform.OS !== 'android' && {
    zIndex: 1,
  }),
});

const Center = styled.View({
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
});

export const LeagueForm = (
  props: StackScreenProps<RootStackParamList, 'LeagueForm'>,
) => {
  const editLeagueData = props.route.params?.data;

  const initialValues: Partial<CreateLeagueDto> = {
    name: editLeagueData?.dto.name || '',
    description: editLeagueData?.dto.description || '',
    duration: editLeagueData?.dto.duration || 7,
    repeat: editLeagueData ? editLeagueData.dto.repeat : true,
    sportId: editLeagueData?.dto.sportId || undefined,
  };

  const mode: LeagueFormMode = !editLeagueData ? 'create' : 'edit';

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [image, setImage] = useState<ImagePickerDialogResponse>();

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    isSubmitting,
    errorMessage,
  } = useForm(initialValues);

  const {openModal, closeModal} = useModal();

  const {data: sportsData, isFetchedAfterMount: isSportsFetched} = useSports();

  const {mutateAsync: createLeague} = useCreateLeague();

  const {mutateAsync: editLeague} = useEditLeague();

  const {mutateAsync: deleteLeague, isLoading: isDeleting} = useDeleteLeague();

  const {mutateAsync: uploadImage, isLoading: isImageUploading} =
    useUploadImage();

  const sportsMapped = (sportsData?.results || []).map(sport => ({
    value: sport.id,
    label: sport.name,
  }));

  const isCreatingLeague = isImageUploading || isSubmitting;

  useEffect(() => {
    if (!values.sportId && sportsMapped.length)
      handleChange('sportId')(sportsMapped[0].value);
  }, [sportsData]);

  const handleOnSubmitPressed = async () => {
    let imgResult: any;

    try {
      if (image) {
        imgResult = await uploadImage({
          image,
          type: 'cover' as ImageType,
        });
      }

      handleSubmit(async () => submitForm(imgResult?.id));
    } catch (e) {
      console.log(e);
    }
  };

  const submitForm = async (imageId?: string) => {
    try {
      const baseDto = {...values};
      if (imageId) baseDto.imageId = imageId;

      const result =
        mode === 'create'
          ? await createLeague(baseDto as CreateLeagueDto)
          : await editLeague({
              id: editLeagueData!.id,
              dto: {...baseDto, sportId: undefined},
            });

      if (result) {
        if (mode === 'create') {
          setTimeout(() => {
            navigation.goBack();
            navigation.navigate('League', {
              id: (result as LeaguePublic).id,
              league: result,
            });
          }, 0);
        } else {
          navigation.goBack();
        }
      }
    } catch (e) {
      const requestErrors = getErrors(e);
      return requestErrors;
    }
  };

  const handleOnDeletePressed = async () => {
    if (!editLeagueData?.id) return;

    openModal(id => {
      return (
        <Modal
          title={'Delete League?'}
          description={'Are you sure you want to delete this league?'}
          buttons={[
            {
              text: 'Delete League',
              type: 'danger',
              onPress: async () => {
                try {
                  closeModal(id);

                  const result = await deleteLeague(editLeagueData.id);

                  if (result.affected) {
                    navigation.dispatch(StackActions.pop(2));
                  }
                } catch (e) {
                  Alert.alert(
                    'Something went wrong',
                    'Please try again later.',
                  );
                }
              },
            },
            {
              text: 'Back',
              textOnly: true,
              style: {marginBottom: -10},
              onPress: () => closeModal(id),
            },
          ]}
        />
      );
    });
  };

  return (
    <>
      <KeyboardAvoidingView enabled={Platform.OS === 'ios'}>
        {isSportsFetched ? (
          <ScrollView
            contentContainerStyle={{
              paddingTop: NAVBAR_HEIGHT + insets.top + 20,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}>
            <FormContentWrapper>
              <ImagePicker
                style={{marginBottom: 10}}
                imageSrc={
                  image
                    ? image.uri
                    : editLeagueData
                    ? editLeagueData.imageUrl
                    : undefined
                }
                label={'Select an image for your league'}
                onImagePicked={setImage}
                error={fieldErrors.imageId}
              />

              <StyledInputField
                label={'Title'}
                value={values.name}
                error={fieldErrors.name}
                onChangeText={handleChange('name')}
                placeholder={'League Title'}
                returnKeyType={'next'}
              />

              <StyledInputField
                label={'Overview / description'}
                value={values.description}
                error={fieldErrors.description}
                onChangeText={handleChange('description')}
                placeholder={'How would you best describe your league'}
                multiline={true}
              />

              <DropdownContainer>
                {mode === 'create' && (
                  <FormDropdown
                    label={'Sport'}
                    items={sportsMapped}
                    value={values.sportId}
                    onValueChange={handleChange('sportId')}
                    prompt={'Select sport type'}
                    style={{marginRight: 5, flex: 1}}
                  />
                )}

                <FormDropdown
                  label={'Leaderboard duration'}
                  items={leagueDurations}
                  value={values.duration}
                  onValueChange={handleChange('duration')}
                  prompt={'Select leaderboard duration'}
                  style={{marginLeft: 5, flex: 1}}
                />
              </DropdownContainer>

              <Checkbox
                onPress={() => handleChange('repeat')(!values.repeat)}
                checked={values.repeat!}
                text={'Repeat this league'}
              />

              {!!errorMessage && <FormError>{errorMessage}</FormError>}
            </FormContentWrapper>

            <Button
              text={mode === 'create' ? 'Create League' : 'Save Changes'}
              onPress={handleOnSubmitPressed}
              loading={isCreatingLeague}
              disabled={isCreatingLeague || isDeleting}
            />

            {mode === 'edit' && (
              <Button
                style={{marginTop: 10}}
                text={'Delete'}
                outline
                type={'danger'}
                onPress={handleOnDeletePressed}
                loading={isDeleting}
                disabled={isDeleting || isCreatingLeague}
              />
            )}
          </ScrollView>
        ) : (
          <Center>
            <BfitSpinner />
          </Center>
        )}
      </KeyboardAvoidingView>

      <Navbar
        overlay
        title={mode === 'create' ? 'Create League' : 'Edit League'}
      />
    </>
  );
};
