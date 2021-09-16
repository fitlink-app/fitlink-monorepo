import React from 'react';
import styled from 'styled-components/native';
import {View} from 'react-native';
import {Label, TouchHandler} from '@components';

const Container = styled.View(({theme: {colors}}) => ({
  paddingVertical: 12,
  paddingHorizontal: 10,
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomWidth: 0.5,
  borderColor: 'rgba(255,255,255,.15)',
}));

const SpacedRow = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const VerticalSpace = styled.View({height: 5});

interface ActivityItemProps {
  name: string;
  activityType: string;
  distance: string;
  date?: string;
  cost?: string;
  onPress: () => void;
}

export const ActivityItem = ({
  name,
  activityType,
  distance,
  date,
  cost,
  onPress,
}: ActivityItemProps) => {
  return (
    <TouchHandler {...{onPress}}>
      <Container>
        <SpacedRow>
          <Label
            appearance={'primary'}
            type={'subheading'}
            style={{flexShrink: 1}}>
            {name}
          </Label>

          <Label appearance={'accentSecondary'}>{cost || 'Free'}</Label>
        </SpacedRow>

        <VerticalSpace />

        <SpacedRow>
          <Label
            appearance={'accentSecondary'}
            style={{paddingRight: 10, flexShrink: 1}}>
            {activityType}
          </Label>

          <View style={{alignItems: 'flex-end'}}>
            {!!date && (
              <>
                <Label appearance={'accent'}>{date}</Label>
              </>
            )}

            <Label style={{marginTop: date ? 5 : 0}} appearance={'accent'}>
              {distance} away
            </Label>
          </View>
        </SpacedRow>
      </Container>
    </TouchHandler>
  );
};
