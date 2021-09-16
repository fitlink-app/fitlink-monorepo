import {Card, FormDropdown, Label} from '@components';
import React from 'react';
import {
  PRIVACY_ITEMS,
  UserPrivacySettingsValue,
} from 'redux/settings/settingsSlice';

import styled from 'styled-components/native';

const Wrapper = styled.View({
  height: '100%',
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
  const privacySettings = {};

  const handlePrivacyChange = (
    value: UserPrivacySettingsValue,
    field: string,
  ) => {
    const newPrivacySettings: {[key: string]: UserPrivacySettingsValue} = {
      ...privacySettings,
    };
    newPrivacySettings[field] = value;
    // dispatch(setPrivacySettings(newPrivacySettings as UserPrivacySettings));
  };

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
                prompt={'Select daily statistics privacy'}
                items={PRIVACY_ITEMS}
                value={PRIVACY_ITEMS[0].value}
                onValueChange={value =>
                  handlePrivacyChange(value, 'daily_statistics')
                }
              />
            </SettingRow>

            <SettingRow style={{marginBottom: 0}}>
              <SettingLabel>Activities</SettingLabel>
              <SettingDropdown
                items={PRIVACY_ITEMS}
                value={PRIVACY_ITEMS[0].value}
                onValueChange={value =>
                  handlePrivacyChange(value, 'activities')
                }
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
