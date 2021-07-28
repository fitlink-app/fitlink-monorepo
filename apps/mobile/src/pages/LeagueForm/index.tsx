import {
  Button,
  Checkbox,
  FormDropdown,
  InputField,
  Navbar,
  ImagePicker,
  NAVBAR_HEIGHT,
  FormError,
} from '@components';
import {
  ImagePickerDialogResponse,
  useCreateLeague,
  useDeleteLeague,
  useEditLeague,
  useForm,
  useLeague,
  useSports,
  useUploadImage,
} from '@hooks';
import React, {useState} from 'react';
import {ActivityIndicator, Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {CreateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/create-league.dto';
import {getErrors} from '@api';
import {useNavigation} from '@react-navigation/native';
import {useEffect} from 'react';
import {RootStackParamList} from 'routes/types';
import {StackScreenProps} from '@react-navigation/stack';

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

const Wrapper = styled.View({flex: 1});

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

const initialValues: Partial<CreateLeagueDto> = {
  name: '',
  description: '',
  duration: leagueDurations[0].value,
  repeat: true,
  sportId: undefined,
};

export const LeagueForm = (
  props: StackScreenProps<RootStackParamList, 'LeagueForm'>,
) => {
  const id = props.route.params?.id;

  const mode: LeagueFormMode = !id ? 'create' : 'edit';

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const {
    handleChange,
    handleSubmit,
    values,
    setValues,
    fieldErrors,
    isSubmitting,
    errorMessage,
  } = useForm(initialValues);

  // Use league data if editing league
  const {data: league, isFetchedAfterMount: isLeagueFetched} = useLeague(id);

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

  const [image, setImage] = useState<ImagePickerDialogResponse>();

  useEffect(() => {
    if (!values.sportId && sportsMapped.length)
      handleChange('sportId')(sportsMapped[0].value);
  }, [sportsData]);

  useEffect(() => {
    if (id && league) {
      setValues({
        name: league.name,
        description: league.description,
        duration: league.duration,
        repeat: league.repeat,
        sportId: league.sport.id,
      });
    }
  }, [league]);

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

      console.log(baseDto);

      const result = !id
        ? await createLeague(baseDto as CreateLeagueDto)
        : await editLeague({
            id,
            dto: {...baseDto, sportId: undefined},
          });

      if (result) navigation.goBack();
    } catch (e) {
      const requestErrors = getErrors(e);
      console.log(requestErrors);
      return requestErrors;
    }
  };

  const handleOnDeletePressed = async () => {
    if (!id) return;
    const result = await deleteLeague(id);
    console.log(result);
  };

  return (
    <Wrapper>
      <Navbar
        overlay
        title={mode === 'create' ? 'Create League' : 'Edit League'}
      />

      {isSportsFetched && (isLeagueFetched || mode === 'create') ? (
        <ScrollView
          contentContainerStyle={{
            marginTop: NAVBAR_HEIGHT + insets.top + 20,
            marginBottom: 20,
            paddingHorizontal: 20,
          }}>
          <FormContentWrapper>
            <ImagePicker
              style={{marginBottom: 10}}
              imageSrc={
                image
                  ? image.uri
                  : league
                  ? league.image.url_640x360
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
              returnKeyType={'next'}
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
            disabled={isCreatingLeague}
          />

          {mode === 'edit' && (
            <Button
              style={{marginTop: 10}}
              text={'Delete'}
              outline
              type={'danger'}
              onPress={handleOnDeletePressed}
              loading={isDeleting}
              disabled={isDeleting}
            />
          )}
        </ScrollView>
      ) : (
        <Center>
          <ActivityIndicator color={colors.accent} />
        </Center>
      )}
    </Wrapper>
  );
};
