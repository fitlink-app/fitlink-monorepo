import React from 'react';
import styled from 'styled-components/native';
import {View} from 'react-native';
import {Label, TouchHandler} from '@components';

const Container = styled.View({
  paddingVertical: 16,
  paddingHorizontal: 5,
  alignItems: 'center',
  justifyContent: 'center',
  borderBottomWidth: 1,
  borderColor: 'rgba(86, 86, 86, 0.3)',
});

const SpacedRow = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const NumberContainer = styled.View(({theme: {colors}}) => ({
  paddingVertical: 3,
  paddingHorizontal: 8,
  borderRadius: 999,
  backgroundColor: colors.accent,
  marginRight: 11,
  alignItems: 'center',
  justifyContent: 'center',
}));

const MapMakerIcon = styled.Image({
  marginRight: 6
});

const VerticalSpace = styled.View({height: 5});

interface ActivityItemProps {
  name: string;
  activityType: string;
  distance: string;
  date?: string;
  cost?: string;
  number?: number;
  onPress?: () => void;
}

export const ActivityItem = ({
  name,
  activityType,
  distance,
  date,
  cost,
  number,
  onPress,
}: ActivityItemProps) => {
  return (
    <TouchHandler {...{onPress}}>
      <Container>
        <SpacedRow>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {
              number ? (
                <NumberContainer>
                  <Label appearance={'black'}>{number}</Label>
                </NumberContainer>
              ) : null
            }
            <Label type={number ? 'body' : 'subheading'} bold={number ? false : true} style={{flexShrink: 1}}>
              {name}
            </Label>
          </View>

          <Label appearance={'accentSecondary'}>{cost || 'Free'}</Label>
        </SpacedRow>

        <VerticalSpace />

        <SpacedRow>
          <View style={{flexDirection: 'row', alignItems: 'center', marginLeft: number ? 36 : 0}}>
            <MapMakerIcon source={require('../../../../../../assets/images/icon/map-marker.png')} />
            <Label>{distance}</Label>
          </View>
          <Label>{date}</Label>
        </SpacedRow>
      </Container>
    </TouchHandler>
  );
};
