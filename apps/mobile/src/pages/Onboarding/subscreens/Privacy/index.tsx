import {Card, FormDropdown, Label} from '@components';
import React from 'react';
import {
  PRIVACY_ITEMS,
  selectSettings,
  setActivitiesPrivacy,
  setDailyStatisticsPrivacy,
} from 'redux/settings/settingsSlice';
import {PrivacySetting} from '@fitlink/api/src/modules/users-settings/users-settings.constants';

import styled from 'styled-components/native';
import {useDispatch, useSelector} from 'react-redux';

const Wrapper = styled.View({
  height: '100%',
  backgroundColor: 'transparent',
});

const ContentContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  height: '99.9%',
});

const CardContainer = styled.View({
  width: '100%',
});

const SettingRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
});

const SettingLabel = styled(Label).attrs(() => ({
  appearance: 'primary',
  type: 'title',
}))({
  fontSize: 22,
  flex: 1,
});

const SettingDropdown = styled(FormDropdown)({
  width: 120,
});

export const Privacy = () => {
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);
  console.log('cs');
  console.log(settings);
  return (
    <Wrapper>
      <ContentContainer>
        <Label type={'title'} bold>
          Select your privacy settings
        </Label>
        <Label type={'title'} style={{textAlign: 'center'}}>
          You decide who can see your data
        </Label>

        <CardContainer>
          <Card
            // @ts-ignore
            style={{marginVertical: 20, marginHorizontal: 20, padding: 20}}>
            <SettingRow>
              <SettingLabel>Daily Statistics</SettingLabel>
              <SettingDropdown
                items={PRIVACY_ITEMS}
                value={settings.userSettings?.privacy_daily_statistics}
                onValueChange={value =>
                  dispatch(setDailyStatisticsPrivacy(value))
                }
                prompt={'Select daily statistics privacy'}
              />
            </SettingRow>

            <SettingRow style={{marginBottom: 0}}>
              <SettingLabel>Activities</SettingLabel>
              <SettingDropdown
                items={PRIVACY_ITEMS}
                value={settings.userSettings?.privacy_activities}
                onValueChange={value => dispatch(setActivitiesPrivacy(value))}
                prompt={'Select activity privacy'}
              />
            </SettingRow>
          </Card>
        </CardContainer>

        <Label
          type={'subheading'}
          appearance={'secondary'}
          style={{textAlign: 'center'}}>
          Privacy settings can be updated at any time{'\n'}
          under your account settings
        </Label>
      </ContentContainer>
    </Wrapper>
  );
};
