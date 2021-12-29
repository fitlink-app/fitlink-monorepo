import React, {useState} from 'react';
import styled from 'styled-components/native';
import {View} from 'react-native';
import {Button, Checkbox, Label} from '@components';
import {useDispatch} from 'react-redux';
import {clearChanges, setState, submit} from 'redux/settings/settingsSlice';
import {AppDispatch} from 'redux/store';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';

const ModalWrapper = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
});

interface NewsletterModalProps {
  onCloseCallback: () => void;
  user: User;
}

export const NewsletterModal = ({
  onCloseCallback,
  user,
}: NewsletterModalProps) => {
  const dispatch = useDispatch() as AppDispatch;

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      dispatch(clearChanges());

      dispatch(
        setState({
          name: user?.name || '',
          unitSystem: user?.unit_system || UnitSystem.Imperial,
          timezone: user.timezone,
          avatar: user.avatar,
          goals: {
            goal_mindfulness_minutes: user?.goal_mindfulness_minutes || 0,
            goal_steps: user?.goal_steps || 0,
            goal_floors_climbed: user?.goal_floors_climbed || 0,
            goal_water_litres: user?.goal_water_litres || 0,
            goal_sleep_hours: user?.goal_sleep_hours || 0,
            goal_active_minutes: user?.goal_active_minutes || 0,
          },
          userSettings: {
            newsletter_subscriptions_user: true,
            privacy_activities: user?.settings?.privacy_activities,
            privacy_daily_statistics: user?.settings?.privacy_daily_statistics,
          },
        }),
      );

      await dispatch(submit());
    } finally {
      onCloseCallback();
    }
  };

  return (
    <ModalWrapper>
      <View style={{alignItems: 'center'}}>
        <Label type={'subheading'} style={{textAlign: 'center'}}>
          Be the first to hear about it.
          {'\n'}
          {'\n'}
          Get the Fitlink newsletter for tips and insider info on the app,
          rewards and all things health and wellness.
          {'\n'}
          {'\n'}
          Yes? Awesome 🙂
        </Label>

        <View style={{paddingVertical: 30}}>
          <Checkbox
            checked={consent}
            text={'I consent to receive Fitlink newsletters via email.'}
            onPress={() => setConsent(prevValue => !prevValue)}
          />
        </View>
      </View>

      <Button
        disabled={!consent || loading}
        onPress={handleSubscribe}
        text={loading ? undefined : 'Subscribe'}
        loading={loading}
        style={{marginBottom: 10}}
      />
      <Button onPress={onCloseCallback} text={'Not Now'} textOnly />
    </ModalWrapper>
  );
};
