import React from 'react';
import {Card} from '../../../components/common';
import styled from 'styled-components/native';

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 40,
});

const Title = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#ffffff',
});

const SeeAllText = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
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
  position: 'relative',
  width: '100%',
  height: 89,
  paddingTop: 20,
  paddingLeft: 24,
  paddingBottom: 22,
  paddingRight: 24,
  backgroundColor: 'rgba(255,255,355,0.4)',
});

const MembersText = styled.Text({
  position: 'relative',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#ffffff',
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 7,
});

const DistanceValue = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 18,
  lineHeight: 21,
  color: '#00E9D7',
});

const PlaceText = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '600',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
  color: '#00E9D7',
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
  return (
    <>
      <HeaderContainer>
        <Title>Compete to earn leagues</Title>
        <SeeAllText>see all</SeeAllText>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({members, daily_distance, place_name, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <Line />
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
    </>
  );
};
