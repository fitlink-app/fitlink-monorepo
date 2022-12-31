import React from 'react';
import { Text } from 'react-native';
import {Card, Label} from '../../../components/common';
import styled from 'styled-components/native';
import {TouchHandler} from '@components';
import {useNavigation} from '@react-navigation/core';
import { BlurView  } from '@react-native-community/blur';

const Wrapper = styled.View({
  paddingHorizontal: 10
});

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 40,
});

const Title = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: 'capitalize',
  color: '#ACACAC',
});

const SliderContainer = styled.ScrollView.attrs(() => ({
  horizontal: true,
  overScrollMode: 'never',
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    justifyContent: 'space-between',
  },
}))({});

const CardContainer = styled(Card)({
  width: 327,
  height: 249,
  marginTop: 23,
  marginRight: 14,
  overflow: 'hidden',
});

const CardImage = styled.Image({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  marginTop: 158,
  border: 0,
  opacity: 0.2,
});

const CardInfo = styled.View({
  // position: 'relative',
  width: '100%',
  height: 89,
  paddingTop: 20,
  paddingLeft: 24,
  paddingBottom: 22,
  paddingRight: 24,
  zIndex: 999,
});

const MembersText = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 7,
});

const DistanceValue = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
  appearance: 'accent'
}))({
  fontSize: 18,
  lineHeight: 21,
});

const PlaceText = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'accent'
}))({
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
  marginTop: 4,
});

const data = [
  {
    members: 468,
    daily_distance: 100,
    place_name: '1st place',
    img: require('../../../../assets/images/Cycling-1-1.png'),
  },
  {
    members: 334,
    daily_distance: 200,
    place_name: '2nd place',
    img: require('../../../../assets/images/Cycling-1-2.png'),
  },
];

export const CompeteLeagues = () => {
  const navigation = useNavigation();

  return (
    <Wrapper>
      <HeaderContainer>
        <Title>Compete to earn leagues</Title>
        <TouchHandler onPress={() => navigation.navigate('Leagues')}>
          <SeeAllText>see all</SeeAllText>
        </TouchHandler>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({members, daily_distance, place_name, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <Line />
              <BlurView 
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: 89,
                  marginTop: 160,
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }}
                blurRadius={1}
                overlayColor={'transparent'}
              />
              <CardInfo>
                <MembersText>{members} Members</MembersText>
                <PlaceSection>
                  <DistanceValue>The Daily {daily_distance}Km</DistanceValue>
                  <PlaceText>{place_name}</PlaceText>
                </PlaceSection>
              </CardInfo>
            </CardContainer>
          ))}
        </>
      </SliderContainer>
    </Wrapper>
  );
};
