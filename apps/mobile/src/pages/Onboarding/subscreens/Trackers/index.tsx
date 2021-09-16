import {Label} from '@components';
import React from 'react';
import {Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import styled from 'styled-components/native';
import {TrackerButton} from './components/TrackerButton';

const Wrapper = styled.View({
  height: '100%',
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

const ButtonWrapper = styled.View({
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
});

const LabelWrapper = styled.View({
  marginBottom: 30,
  width: 256,
});

export const Trackers = () => {
  function renderButtons() {
    const buttons = [];

    if (Platform.OS === 'android') {
      buttons.push(
        <TrackerButton label={'Google Fit'} providerType={'google_fit'} />,
      );
    }

    if (Platform.OS === 'ios') {
      buttons.push(
        <TrackerButton
          label={'Apple Health'}
          providerType={'apple_healthkit'}
        />,
      );
    }

    buttons.push(<TrackerButton label={'Strava'} providerType={'strava'} />);
    buttons.push(<TrackerButton label={'Fitbit'} providerType={'fitbit'} />);

    return <ButtonWrapper>{buttons}</ButtonWrapper>;
  }
  return (
    <Wrapper>
      <ContentContainer>
        <LabelWrapper>
          <Label type="title" bold style={{textAlign: 'center'}}>
            Great, we’re almost there!
          </Label>
          <Label type="title" style={{textAlign: 'center'}}>
            In order to start earning rewards you need to link your preferred
            activity trackers
          </Label>
        </LabelWrapper>
        {renderButtons()}
      </ContentContainer>
    </Wrapper>
  );
};
