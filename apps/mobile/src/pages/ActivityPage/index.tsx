import React, {useRef, useState, useEffect} from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from 'routes/types';
import {View, ScrollView, Dimensions, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Navbar} from '@components';
import styled, {useTheme} from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {Label, Avatar} from '../../components/common';

const CarouselContainer = styled.View({
  flexDirection: 'row',
  width: '100%',
});

const CarouselItem = styled.View({
  height: 473,
});

const DotView = styled.View({
  position: 'absolute',
  flexDirection: 'row',
  marginTop: 441,
  right: 23,
});

const BackgroundImage = styled.Image({
  position: 'absolute',
  width: '100%',
});

const BackgroundOverlay = styled(LinearGradient).attrs(() => ({
  start: {x: 1, y: 0},
  end: {x: 0, y: 0},
  colors: ['rgba(6, 6, 6, 0.85)', 'rgba(6, 6, 6, 0)'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const Details = styled.View({
  width: '100%',
  paddingLeft: 23,
  paddingRight: 23,
  paddingTop: 35,
});

const DetailName = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  textAlign: 'right',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  opacity: 0.8,
});

const DetailValue = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'accent',
}))({
  textAlign: 'right',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 16,
  marginBottom: 4,
});

const FitnessName = styled(Label).attrs(() => ({
  type: 'title',
  bold: true,
  numberOfLines: 1
}))({
  overflow: 'hidden',
  textAlign: 'right',
  fontFamily: 'Roboto',
  fontSize: 40,
  marginTop: 21,
  marginLeft: 10
});

const UserSection = styled.View({
  position: 'relative',
  width: '100%',
  height: 98,
  backgroundColor: '#181818',
  border: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)',
  boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.25)',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: 15,
  paddingRight: 20,
});

const UserProfile = styled.View({
  width: '50%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const UserInfo = styled.View({
  marginLeft: 17,
});

const UserName = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontFamily: 'Roboto',
  fontSize: 20,
  lineHeight: 27,
});

const UserDate = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontFamily: 'Roboto',
  fontSize: 17,
  lineHeight: 27,
  opacity: 0.7,
});

const ShareIcon = styled.Image({});

const MapImage = styled.Image({
  position: 'relative',
  width: '100%',
  height: 316,
  resizeMode: 'stretch',
});

const data = [
  {
    id: 1,
    title: 'Morning Run',
    distance: 4.97,
    speed: '8:22/mile',
    bfit: 52,
    calories: 735,
    time: 43,
    elevation_gain: 235,
    image: require('../../../assets/images/activity_feed/background.png'),
  },
  {
    id: 2,
    title: 'Early Morning Run',
    distance: 4.97,
    speed: '8:22/mile',
    bfit: 52,
    calories: 735,
    time: 43,
    elevation_gain: 235,
    image: require('../../../assets/images/activity_feed/background.png'),
  },
  {
    id: 3,
    title: 'Morning Yoga',
    distance: 4.97,
    speed: '8:22/mile',
    bfit: 52,
    calories: 735,
    time: 43,
    elevation_gain: 235,
    image: require('../../../assets/images/activity_feed/background.png'),
  },
];

const width = Dimensions.get('window').width;
const delay = 5000;

// Carousal Component
export const ActivityPage = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const [selectedIndex, setselectedIndex] = useState<Number>(0);
  const scrollView = useRef(null);

  // Script which will only executed when component initilizes
  useEffect(() => {
    const fn = setInterval(() => {
      setselectedIndex((oldCount: Number) =>
        oldCount === data.length - 1 ? 0 : Number(oldCount) + 1,
      );
    }, delay);
    return () => {
      clearInterval(fn);
    };
  }, []);

  // Script will executed every time selectedIndex updates
  useEffect(() => {
    scrollView.current.scrollTo({
      animated: true,
      x: width * Number(selectedIndex),
      y: 0,
    });
  }, [selectedIndex]);

  const setIndex = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    setselectedIndex(Math.floor(contentOffset.x / viewSize.width));
  };

  return (
    <ScrollView>
      <View>
        <ScrollView
          ref={scrollView}
          horizontal
          pagingEnabled
          onMomentumScrollEnd={setIndex}
          onContentSizeChange={() => scrollView.current.scrollToEnd()}>
          <CarouselContainer>
            {data.map(item => (
              <CarouselItem style={{width: width}}>
                <BackgroundImage source={item.image} />
                <BackgroundOverlay />
                <View style={{marginTop: 28}}>
                  <Navbar iconColor={colors.text} />
                </View>
                <Details>
                  <DetailName>Distance</DetailName>
                  <DetailValue>{item.distance} mi</DetailValue>
                  <DetailName>Speed</DetailName>
                  <DetailValue>{item.speed}</DetailValue>
                  <DetailName>$BFIT</DetailName>
                  <DetailValue>{item.bfit}</DetailValue>
                  <DetailName>Calories</DetailName>
                  <DetailValue>{item.calories}</DetailValue>
                  <DetailName>Time</DetailName>
                  <DetailValue>{item.time} m</DetailValue>
                  <DetailName>Elevation Gain</DetailName>
                  <DetailValue>{item.elevation_gain} ft</DetailValue>
                  <FitnessName>{item.title}</FitnessName>
                </Details>
              </CarouselItem>
            ))}
          </CarouselContainer>
        </ScrollView>
        <DotView>
          {data.map((item, index) => (
            <View
              style={{
                width: 9,
                height: 9,
                backgroundColor:
                  index === selectedIndex
                    ? colors.accent
                    : 'rgba(255, 255, 255, 0.4)',
                borderRadius: 5,
                marginLeft: 7,
              }}
            />
          ))}
        </DotView>
      </View>
      <UserSection>
        <UserProfile>
          <Avatar size={76} radius={18} />
          <UserInfo>
            <UserName>Jennifer</UserName>
            <UserDate>Tuesday 7:30 AM</UserDate>
          </UserInfo>
        </UserProfile>
        <ShareIcon
          source={require('../../../assets/images/icon/share-2.png')}
        />
      </UserSection>
      <MapImage
        source={require('../../../assets/images/activity_feed/map.png')}
      />
    </ScrollView>
  );
};
