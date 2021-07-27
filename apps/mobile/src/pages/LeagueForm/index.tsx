import {
  Button,
  Checkbox,
  FormDropdown,
  InputField,
  Navbar,
  ImagePicker,
  NAVBAR_HEIGHT,
} from '@components';
import {
  ImagePickerDialogResponse,
  useCreateLeague,
  useForm,
  useUploadImage,
} from '@hooks';
import React, {useState} from 'react';
import {Platform, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {ImageType} from '@fitlink/api/src/modules/images/entities/image.entity';
import {CreateLeagueDto} from '@fitlink/api/src/modules/leagues/dto/create-league.dto';
import {getErrors} from '@api';

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

export type LeagueFormMode = 'edit' | 'create';

const initialValues: Partial<CreateLeagueDto> = {
  name: '',
  description: '',
  duration: 7,
  repeat: true,
  sportId: 'f76b204a-d152-406b-be2a-cf1865bf2408',
};

export const LeagueForm = () => {
  const insets = useSafeAreaInsets();

  const {
    handleChange,
    handleSubmit,
    values,
    fieldErrors,
    errorMessage,
    isSubmitting,
    isSubmitted,
  } = useForm(initialValues);

  const {mutateAsync: createLeague} = useCreateLeague();

  const {mutateAsync: uploadImage} = useUploadImage();

  const [image, setImage] = useState<ImagePickerDialogResponse>();

  // TEMP VARIABLES
  const mode: LeagueFormMode = 'create';

  const handleOnSubmit = async () => {
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
      await createLeague({...values, imageId} as CreateLeagueDto);
    } catch (e) {
      const requestErrors = getErrors(e);
      return requestErrors;
    }
  };

  return (
    <Wrapper>
      <Navbar
        overlay
        title={mode === 'create' ? 'Create League' : 'Edit League'}
      />

      <ScrollView
        contentContainerStyle={{
          marginTop: NAVBAR_HEIGHT + insets.top + 20,
          marginBottom: 20,
          paddingHorizontal: 20,
        }}>
        <FormContentWrapper>
          <ImagePicker
            style={{marginBottom: 10}}
            imageSrc={image ? image.uri : undefined}
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
            <FormDropdown
              label={'Sport'}
              items={[
                {value: 'sportIdValue', label: 'Placeholder Sport'},
                {value: 'sportIdValue2', label: 'Placeholder Sport 2'},
              ]}
              value={values.sportId}
              onValueChange={handleChange('sportId')}
              prompt={'Select sport type'}
              style={{marginRight: 5, flex: 1}}
            />

            <FormDropdown
              label={'Leaderboard duration'}
              items={[
                {value: 7, label: '1 week'},
                {value: 14, label: '2 weeks'},
              ]}
              value={values.duration}
              onValueChange={value => handleChange('duration')(value)}
              prompt={'Select leaderboard duration'}
              style={{marginLeft: 5, flex: 1}}
            />
          </DropdownContainer>

          <Checkbox
            onPress={() => handleChange('repeat')(!values.repeat)}
            checked={values.repeat!}
            text={'Repeat this league'}
          />
        </FormContentWrapper>

        <Button
          text={mode === 'create' ? 'Create League' : 'Save Changes'}
          onPress={handleOnSubmit}
        />
      </ScrollView>
    </Wrapper>
  );
};
