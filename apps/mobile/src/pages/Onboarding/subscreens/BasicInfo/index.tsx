import {InputField, KeyboardAvoidingView, Label} from '@components';
import {ImagePickerDialogResponse} from '@hooks';
import React from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {selectSettings, setAvatar, setName} from 'redux/settings/settingsSlice';
import {AppDispatch} from 'redux/store';
import styled from 'styled-components/native';
import {AvatarPicker} from './components';

const Wrapper = styled.View({
  height: '100%',
  padding: 20,
});

const ContentContainer = styled(ScrollView).attrs(() => ({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  keyboardShouldPersistTaps: 'never',
  scrollEnabled: false,
}))({});

const NameFieldContainer = styled.View({
  width: '100%',
  paddingHorizontal: 40,
  marginTop: 20,
});

export const BasicInfo = () => {
  const dispatch = useDispatch() as AppDispatch;
  const settings = useSelector(selectSettings);

  const handleOnImagePicked = (response: ImagePickerDialogResponse) => {
    dispatch(setAvatar(response));
  };

  const handleNameChange = (text: string) => {
    dispatch(setName(text));
  };

  return (
    <Wrapper>
      <KeyboardAvoidingView>
        <ContentContainer>
          <AvatarPicker
            onImagePicked={handleOnImagePicked}
            url={settings.tempAvatar?.uri || settings.avatar?.url_512x512}
          />

          <NameFieldContainer>
            <Label
              type={'title'}
              style={{textAlign: 'center', marginBottom: 20}}>
              How would you like your name{'\n'}displayed on your profile
            </Label>
            <InputField
              value={settings.name}
              onChangeText={handleNameChange}
              placeholder={'Your name'}
              returnKeyType={'done'}
            />
          </NameFieldContainer>
        </ContentContainer>
      </KeyboardAvoidingView>
    </Wrapper>
  );
};
