import {Label} from '@components';
import {useFitbit, useProviders, useStrava} from '@hooks';
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
  const {providerList} = useProviders();

  const {isLinking: isStravaLinking, link: linkStrava} = useStrava();
  const {isLinking: isFitbitLinking, link: linkFitbit} = useFitbit();

  function renderButtons() {
    return (
      <ButtonWrapper>
        {Platform.OS === 'android' && (
          <TrackerButton
            label={'Google Fit'}
            isLinked={providerList.includes('google_fit')}
            isLoading={false}
          />
        )}
        {Platform.OS === 'ios' && (
          <TrackerButton
            label={'Apple Health'}
            isLinked={providerList.includes('apple_health')}
            isLoading={false}
          />
        )}

        <TrackerButton
          label={'Strava'}
          isLinked={providerList.includes('strava')}
          isLoading={isStravaLinking}
          onPress={linkStrava}
        />
        <TrackerButton
          label={'Fitbit'}
          isLinked={providerList.includes('fitbit')}
          isLoading={isFitbitLinking}
          onPress={linkFitbit}
        />
      </ButtonWrapper>
    );
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
