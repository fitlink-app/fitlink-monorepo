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
  height: 175,
  marginTop: 23,
  marginRight: 14,
  overflow: 'hidden',
});

const CardImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const CardHeader = styled.View({
  position: 'relative',
  width: '100%',
  height: 53,
  paddingTop: 22,
  paddingLeft: 24,
  paddingRight: 24,
  backgroundColor: 'rgba(255,255,355,0.4)',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const DateText = styled.Text({
  position: 'relative',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#ffffff',
  opacity: 0.6,
});

const HeaderLine = styled.View({
  width: 98,
  height: 8,
  marginTop: 2,
  backgroundColor: '#00E9D7',
  borderRadius: 100,
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  border: 0,
  opacity: 0.2,
});

const CardBody = styled.View({
  width: '100%',
  height: 120,
  paddingTop: 56,
  paddingLeft: 24,
  paddingRight: 18,
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 4,
});

const DateValue = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  color: '#ffffff',
});

const PlaceText = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '600',
  fontSize: 18,
  lineHeight: 21,
  textTransform: 'uppercase',
  color: '#00E9D7',
});

const AddBtn = styled.View({
  width: 44,
  height: 44,
  backgroundColor: '#00E9D7',
  borderRadius: 22,
  marginTop: -12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const AddIcon = styled.Text({
  textAlign: 'center',
  fontSize: 28,
  marginTop: -3,
});

const data = [
  {
    date: 'BFIT 700',
    date1: 20,
    place: 'Fitbit Versa 4',
    img: require('../../../../assets/images/rewards-1.png'),
  },
  {
    date: 'TODAY AT 1:24 PM',
    date1: 20,
    place: 'Climbed Goal',
    img: require('../../../../assets/images/rewards-2.png'),
  },
];

export const UnlockedRewards = () => {
  return (
    <>
      <HeaderContainer>
        <Title>Unlocked Rewards</Title>
        <SeeAllText>see all</SeeAllText>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({date, date1, place, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <CardHeader>
                <DateText>{date}</DateText>
                <HeaderLine />
              </CardHeader>
              <Line />
              <CardBody>
                <DateValue>{date1} Days Left</DateValue>
                <PlaceSection>
                  <PlaceText>{place}</PlaceText>
                  <AddBtn>
                    <AddIcon>+</AddIcon>
                  </AddBtn>
                </PlaceSection>
              </CardBody>
            </CardContainer>
          ))}
        </>
      </SliderContainer>
    </>
  );
};
