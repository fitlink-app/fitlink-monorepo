import React from 'react';
import {View, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {TouchHandler} from '@components';
import {Card, Label} from '../../components/common';

const Wrapper = styled.View({flex: 1});

const CoverImage = styled(Card)({
  width: '100%',
  height: 237,
  overflow: 'hidden',
  marginBottom: 5,
});

const CoverBackgroundImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const CoverInfo = styled.View({
  width: 253,
  marginLeft: 21,
});

const CoverTitle = styled(Label).attrs(() => ({
  type: 'title',
}))({});

const CoverDate = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
}))({});

const UserList = styled.View({
  marginBottom: 38,
});

const UserCard = styled.View({
  marginTop: 23,
  width: '100%',
  height: 134,
});

const Line = styled.View({
  width: '100%',
  height: 3,
  background: '#565656',
  opacity: 0.5,
});

const CardBody = styled.View({
  width: '100%',
  height: 131,
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingTop: 14,
});

const UserProfile = styled.View({
  width: '57%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const FitnessDetails = styled.View({
  width: '43%',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

const UserImageCard = styled.View({
  width: 76,
  height: 76,
  borderRadius: 18,
});

const UserImage = styled.Image({
  width: '100%',
  height: '100%',
});

const UserInfo = styled.View({
  width: '60%',
});

const FitnessType = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
}))({
  width: '100%',
  fontFamily: 'Roboto',
  lineHeight: 19,
  textTransform: 'capitalize',
  marginTop: -10,
});

const Username = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'capitalize',
  marginTop: 6,
});

const DateText = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  color: '#ACACAC',
  marginTop: 6,
});

const ButtonGroup = styled.View({
  height: 36,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginBottom: 7,
});

const Bfit = styled.View({
  height: 30,
  borderRadius: 20,
  backgroundColor: '#ffffff',
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 17,
  paddingRight: 17,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const BfitValue = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontSize: 12,
  lineHeight: 14,
  color: '#060606',
});

const LikeButton = styled.View({
  marginLeft: 12,
  width: 36,
  height: 36,
  borderRadius: 18,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const ThumbIcon = styled.Image({});

const DetailView = styled.View({
  marginTop: 7,
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

const DetailInfo = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  color: '#ACACAC',
});

const DetailIcon = styled.Image({
  marginLeft: 10,
});

const data = [
  {
    img: require('../../../assets/images/activity_feed/user-1.png'),
    fitness_type: 'Morning Run',
    username: 'Jon Smith',
    date: 'Today at 9:28 AM',
    mark: '7 $BFIT',
    like: true,
    distance: '4.97',
    speed: '8:22',
    time: 43,
  },
  {
    img: require('../../../assets/images/activity_feed/user-2.png'),
    fitness_type: 'Morning Yoga Session',
    username: 'Jennifer',
    date: 'Today at 7:30 AM',
    mark: '13 $BFIT',
    like: false,
    distance: '12.47',
    speed: '25:04',
    time: 65,
  },
  {
    img: require('../../../assets/images/activity_feed/user-3.png'),
    fitness_type: 'Early Morning Run',
    username: 'Jennifer',
    date: 'Today at 9:28 AM',
    mark: '22 $BFIT',
    like: true,
    distance: '6.90',
    speed: '12:04',
    time: 45,
  },
  {
    img: require('../../../assets/images/activity_feed/user-4.png'),
    fitness_type: 'Morning Run',
    username: 'Adam',
    date: 'Today at 5:30 AM',
    mark: '44 Points',
    like: false,
    distance: '2.90',
    speed: '8:22',
    time: 56,
  },
];

export const ActivityFeed = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingBottom: 37,
        }}>
        <CoverImage>
          <CoverBackgroundImage
            source={require('../../../assets/images/activity_feed/cover-1.png')}
          />
          <CoverInfo style={{marginTop: 137}}>
            <CoverTitle
              style={{
                fontFamily: 'Roboto',
                fontSize: 22,
                fontWeight: '500',
                lineHeight: 26,
              }}>
              10-minute Mindfulness Exercises You Can Do
            </CoverTitle>
            <CoverDate style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              <Label
                type="caption"
                style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
                Fitlink
              </Label>{' '}
              - Tuesday at 9:28 AM
            </CoverDate>
          </CoverInfo>
        </CoverImage>
        <UserList>
          {data.map(
            ({
              img,
              fitness_type,
              username,
              date,
              mark,
              like,
              distance,
              speed,
              time,
            }) => (
              <TouchHandler onPress={() => navigation.navigate('ActivityPage')}>
                <UserCard>
                  <Line />
                  <CardBody>
                    <UserProfile>
                      <UserImageCard>
                        <UserImage source={img} />
                      </UserImageCard>
                      <UserInfo>
                        <FitnessType>{fitness_type}</FitnessType>
                        <Username>{username}</Username>
                        <DateText>{date}</DateText>
                      </UserInfo>
                    </UserProfile>
                    <FitnessDetails>
                      <View>
                        <ButtonGroup>
                          <Bfit>
                            <BfitValue>{mark}</BfitValue>
                          </Bfit>
                          {like ? (
                            <LikeButton
                              style={{backgroundColor: colors.accent}}>
                              <ThumbIcon
                                source={require('../../../assets/images/icon/thumb.png')}
                              />
                            </LikeButton>
                          ) : (
                            <LikeButton style={{backgroundColor: '#ACACAC'}}>
                              <ThumbIcon
                                source={require('../../../assets/images/icon/thumb.png')}
                              />
                            </LikeButton>
                          )}
                        </ButtonGroup>
                        <DetailView>
                          <DetailInfo>
                            Distance:{' '}
                            <Label style={{color: colors.text}}>
                              {distance} mi
                            </Label>
                          </DetailInfo>
                          <DetailIcon
                            source={require('../../../assets/images/icon/map-marker.png')}
                          />
                        </DetailView>
                        <DetailView>
                          <DetailInfo>
                            Speed:{' '}
                            <Label style={{color: colors.text}}>
                              {speed} mile
                            </Label>
                          </DetailInfo>
                          <DetailIcon
                            source={require('../../../assets/images/icon/speed.png')}
                          />
                        </DetailView>
                        <DetailView>
                          <DetailInfo>
                            Time:{' '}
                            <Label style={{color: colors.text}}>{time} m</Label>
                          </DetailInfo>
                          <DetailIcon
                            source={require('../../../assets/images/icon/clock.png')}
                          />
                        </DetailView>
                      </View>
                    </FitnessDetails>
                  </CardBody>
                </UserCard>
              </TouchHandler>
            ),
          )}
        </UserList>
        <CoverImage>
          <CoverBackgroundImage
            source={require('../../../assets/images/activity_feed/cover-2.png')}
          />
          <CoverInfo style={{marginTop: 113}}>
            <CoverTitle
              style={{
                fontFamily: 'Roboto',
                fontSize: 22,
                fontWeight: '500',
                lineHeight: 26,
              }}>
              Why Trees Are Good For Our Mental & Physical Wellbeing
            </CoverTitle>
            <CoverDate style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
              <Label
                type="caption"
                style={{marginTop: 6, fontSize: 14, lineHeight: 16}}>
                Fitlink
              </Label>{' '}
              - Tuesday at 9:28 AM
            </CoverDate>
          </CoverInfo>
        </CoverImage>
      </ScrollView>
    </Wrapper>
  );
};
