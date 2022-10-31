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
  paddingTop: 34,
  paddingLeft: 24,
  paddingRight: 18,
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 4,
});

const RecordValue = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '400',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  color: '#ffffff',
  textTransform: 'capitalize',
  width: 194,
});

const PlaceText = styled.Text({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: '500',
  fontSize: 18,
  lineHeight: 21,
  color: '#00E9D7',
});

const data = [
  {
    date: '1:24 PM',
    record_today: 'Congratulations You Swam 45 Min Today',
    place: 'Swimming',
    img: require('../../../../assets/images/history-1.png'),
  },
  {
    date: '1:24 PM',
    record_today: 'Congratulations You Swam 45 Min Today',
    place: 'Climbing',
    img: require('../../../../assets/images/history-1.png'),
  },
];

export const ActivityHistory = () => {
  return (
    <>
      <HeaderContainer>
        <Title>Activity History</Title>
        <SeeAllText>see all</SeeAllText>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({date, record_today, place, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <CardHeader>
                <DateText>today at {date}</DateText>
              </CardHeader>
              <Line />
              <CardBody>
                <RecordValue>{record_today}</RecordValue>
                <PlaceSection>
                  <PlaceText>{place}</PlaceText>
                </PlaceSection>
              </CardBody>
            </CardContainer>
          ))}
        </>
      </SliderContainer>
    </>
  );
};
