import {Label} from '@components';
import {ProviderType} from '@fitlink/api/src/modules/providers/providers.constants';
import {useFitbit, useProviders, useStrava} from '@hooks';
import {useCustomProvider} from 'hooks/api/providers/custom';
import React from 'react';
import {Platform} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {AppleHealthKitWrapper, GoogleFitWrapper} from 'services';
import styled from 'styled-components/native';
import {TrackerButton} from './components/TrackerButton';

const Wrapper = styled.View({
  height: '100%',
});

const ContentContainer = styled(ScrollView).attrs(() => ({
  contentContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardShouldPersistTaps: 'never',
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
  const {data: providerList} = useProviders();

  const {isLinking: isStravaLinking, link: linkStrava} = useStrava();
  const {isLinking: isFitbitLinking, link: linkFitbit} = useFitbit();

  const {isLinking: isAppleHealthLinking, link: linkAppleHealth} =
    useCustomProvider(ProviderType.AppleHealthkit);

  const {isLinking: isGoogleFitLinking, link: linkGoogleFit} =
    useCustomProvider(ProviderType.GoogleFit);

  function renderButtons() {
    return (
      <ButtonWrapper>
        {Platform.OS === 'android' && (
          <TrackerButton
            label={'Google Fit'}
            isLinked={!!providerList?.includes(ProviderType.GoogleFit)}
            onPress={() => {
              linkGoogleFit(() => {
                GoogleFitWrapper.disconnect();
                return GoogleFitWrapper.authenticate();
              });
            }}
            isLoading={isGoogleFitLinking}
          />
        )}
        {Platform.OS === 'ios' && (
          <TrackerButton
            label={'Apple Health'}
            isLinked={!!providerList?.includes(ProviderType.AppleHealthkit)}
            onPress={() =>
              linkAppleHealth(() => AppleHealthKitWrapper.authenticate())
            }
            isLoading={isAppleHealthLinking}
          />
        )}

        <TrackerButton
          label={'Strava'}
          isLinked={!!providerList?.includes(ProviderType.Strava)}
          isLoading={isStravaLinking}
          onPress={linkStrava}
        />
        <TrackerButton
          label={'Fitbit'}
          isLinked={!!providerList?.includes(ProviderType.Fitbit)}
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
