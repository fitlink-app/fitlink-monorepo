import React from 'react';
import {Card, Label} from '../../../components/common';
import styled from 'styled-components/native';
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
  type: 'subheading',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'subheading',
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
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const DateText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  position: 'relative',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
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
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'capitalize',
  width: 176,
});

const GoalText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
  appearance: 'accent'
}))({
  fontSize: 18,
  lineHeight: 21,
});

const data = [
  {
    title: 'Sunrise Yoga',
    record_today: 'Daily At The Reef Centre 6 AM Start',
    goal_title: 'Climbed Goal',
    img: require('../../../../assets/images/classes-1.png'),
  },
  {
    title: 'today at 1:24 PM',
    record_today: 'Daily At The Reef Centre 6 AM Start',
    goal_title: 'Climbed Goal',
    img: require('../../../../assets/images/classes-2.png'),
  },
];

export const RoutesClasses = () => {
  return (
    <Wrapper>
      <HeaderContainer>
        <Title>Routes And Classes</Title>
        <SeeAllText>see all</SeeAllText>
      </HeaderContainer>

      <SliderContainer>
        <>
          {data.map(({title, record_today, goal_title, img}) => (
            <CardContainer>
              <CardImage source={img} />
              <BlurView 
                style={{
                  position: "absolute",
                  width: '100%',
                  height: 53,
                  backgroundColor: 'rgba(0,0,0,0.2)'
                }}
                blurRadius={1}
                overlayColor={'transparent'}
              />
              <CardHeader>
                <DateText>{title}</DateText>
              </CardHeader>
              <Line />
              <CardBody>
                <RecordValue>{record_today}</RecordValue>
                <GoalSection>
                  <GoalText>{goal_title}</GoalText>
                </GoalSection>
              </CardBody>
            </CardContainer>
          ))}
        </>
      </SliderContainer>
    </Wrapper>
  );
};
