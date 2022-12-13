import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {Card, Label, ProgressCircle} from '@components';

const Container = styled(Card)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  paddingTop: 20,
  paddingBottom: 19,
  paddingLeft: 33,
  paddingRight: 37,
  marginTop: 16,
});

const CardLabel = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 2,
  color: '#565656',
  textTransform: 'uppercase',
});

const Value = styled(Label).attrs(() => ({
  type: 'title',
  numberOfNumbers: 5,
}))({
  fontSize: 42,
  lineHeight: 48,
  marginTop: 9,
});

const CaloriesCircle = styled.View({
  width: 65,
  height: 65,
  borderRadius: 35,
  background: 'rgba(150, 150, 150, 0.1)',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
});

const Calories = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 18,
  lineHeight: 21,
  textAlign: 'center',
  letterSpacing: 2,
  textTransform: 'uppercase',
});

export const CaloriesCard = () => {
  return (
    <Container>
      <View>
        <CardLabel>Total Calories</CardLabel>
        <Value>1240</Value>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <ProgressCircle
          progress={0.87}
          strokeWidth={3}
          backgroundStrokeWidth={2.5}
          bloomIntensity={0.5}
          bloomRadius={5}
          size={81}>
          <CaloriesCircle>
            <Calories>87%</Calories>
          </CaloriesCircle>
        </ProgressCircle>
      </View>
    </Container>
  );
};
