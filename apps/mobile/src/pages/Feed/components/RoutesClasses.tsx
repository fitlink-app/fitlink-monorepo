import React from 'react';
import {Card, Label} from '../../../components/common';
import styled from 'styled-components/native';

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 40,
});

const Title = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#ffffff',
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
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
  backgroundColor: 'rgba(255,255,255,0.2)',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const DateText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  position: 'relative',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
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
  paddingTop: 23,
  paddingLeft: 24,
  paddingRight: 18,
});

const GoalSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 22,
});

const RecordValue = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  color: '#ffffff',
  textTransform: 'capitalize',
  width: 176,
});

const GoalText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 18,
  lineHeight: 21,
  color: '#00E9D7',
});

const data = [
  {
    date: 'Sunrise Yoga',
    record_today: 'Daily At The Reef Centre 6 AM Start',
    goal: 'Climbed Goal',
    img: require('../../../../assets/images/classes-1.png'),
  },
  {
    date: 'today at 1:24 PM',
    record_today: 'Daily At The Reef Centre 6 AM Start',
    goal: 'Climbed Goal',
    img: require('../../../../assets/images/classes-2.png'),
  },
];

export const RoutesClasses = () => {
  return (
    <>
      <HeaderContainer>
        <Title>Routes And Classes</Title>
        <SeeAllText>see all</SeeAllText>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({date, record_today, goal, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <CardHeader>
                <DateText>today at {date}</DateText>
              </CardHeader>
              <Line />
              <CardBody>
                <RecordValue>{record_today}</RecordValue>
                <GoalSection>
                  <GoalText>{goal}</GoalText>
                </GoalSection>
              </CardBody>
            </CardContainer>
          ))}
        </>
      </SliderContainer>
    </>
  );
};
