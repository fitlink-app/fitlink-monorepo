import React, {FC, useEffect, useRef, useState} from 'react';
import {Card, Label, TouchHandler} from '../../../components/common';
import styled from 'styled-components/native';
import {BlurView} from '@react-native-community/blur';
import {useNavigation} from '@react-navigation/core';
import {getDistanceFromLatLonInKm, widthLize} from '@utils';
import {useFindActivitiesMap} from '@hooks';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {ActivityDetailsModal} from '../../Discover/components';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {setCurrentLocation} from '../../../redux/discover/discoverSlice';
import {useDispatch} from 'react-redux';
import {StyleProp, View, ViewStyle} from 'react-native';
import {FEED_CARD_HEIGHT, FEED_CAROUSEL_CARD_WIDTH} from '../constants';

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginHorizontal: widthLize(20),
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
    paddingLeft: widthLize(20),
  },
}))({});

const CardContainer = styled(Card)({
  width: FEED_CAROUSEL_CARD_WIDTH,
  height: FEED_CARD_HEIGHT,
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

const CardBody = styled.View({
  flex: 1,
  paddingHorizontal: 24,
  paddingVertical: 24,
  justifyContent: 'flex-end',
});

const RecordValue = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'capitalize',
  marginTop: 11,
});

const GoalText = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
  appearance: 'accent',
}))({
  fontSize: 18,
  lineHeight: 21,
});

interface RoutesClassesProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const RoutesClasses: FC<RoutesClassesProps> = ({containerStyle}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [userLocation, setUserLocation] = useState({
    lat: 0,
    lng: 0,
  });
  const [modalActivityId, setModalActivityId] = useState<string>();

  const detailsModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    MapboxGL.requestAndroidLocationPermissions();
  }, []);

  const handleOnDetailsBackPressed = () => {
    detailsModalRef.current?.close();
  };

  const onUserLocationUpdate = (location: any) => {
    const {latitude, longitude} = location.coords;
    setUserLocation({lat: latitude, lng: longitude});
    dispatch(setCurrentLocation({lat: latitude, lng: longitude}));
  };

  const {data: activityMarkersData} = useFindActivitiesMap({
    geo_radial: `${userLocation?.lat},${userLocation?.lng},15`,
  });

  const renderActivities = () => {
    const d = activityMarkersData?.results.sort((a, b) => {
      const aDist = getDistanceFromLatLonInKm(
        //@ts-ignore
        a.meeting_point.coordinates[0],
        //@ts-ignore
        a.meeting_point.coordinates[1],
        userLocation?.lat,
        userLocation?.lng,
      );
      const bDist = getDistanceFromLatLonInKm(
        //@ts-ignore
        b.meeting_point.coordinates[0],
        //@ts-ignore
        b.meeting_point.coordinates[1],
        userLocation?.lat,
        userLocation?.lng,
      );
      return aDist - bDist;
    });

    return d?.map((item, index) => {
      const dist = getDistanceFromLatLonInKm(
        //@ts-ignore
        item.meeting_point.coordinates[0],
        //@ts-ignore
        item.meeting_point.coordinates[1],
        userLocation?.lat,
        userLocation?.lng,
      );

      let distanceString = '';

      if (dist >= 1) {
        // km
        const value = dist >= 1000 ? dist.toFixed(0) : dist.toFixed(1);
        distanceString = `${value} km away`;
      } else {
        // meter
        const value = (dist * 1000).toFixed(0);
        distanceString = `${value} meters away`;
      }
      return (
        <TouchHandler
          key={index}
          onPress={() => {
            setModalActivityId(item.id);
            detailsModalRef.current?.present();
          }}>
          <CardContainer>
            <CardImage
              source={require('../../../../assets/images/classes-2.png')}
            />
            <BlurView
              style={{
                position: 'absolute',
                width: '100%',
                height: 53,
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
              blurRadius={1}
              overlayColor={'transparent'}
            />
            <CardHeader>
              <DateText>{item.type.toUpperCase()}</DateText>
            </CardHeader>
            <CardBody style={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}>
              <GoalText>{item.name}</GoalText>
              <RecordValue>{distanceString}</RecordValue>
            </CardBody>
          </CardContainer>
        </TouchHandler>
      );
    });
  };

  return (
    <View style={containerStyle}>
      <HeaderContainer>
        <Title>Routes And Classes</Title>
        <TouchHandler
          onPress={() => {
            navigation.navigate('Discover');
          }}>
          <SeeAllText>see all</SeeAllText>
        </TouchHandler>
      </HeaderContainer>

      <SliderContainer>{renderActivities()}</SliderContainer>
      <MapboxGL.UserLocation visible={true} onUpdate={onUserLocationUpdate} />
      <ActivityDetailsModal
        ref={detailsModalRef}
        onBack={handleOnDetailsBackPressed}
        stackBehavior={'push'}
        activityId={modalActivityId}
      />
    </View>
  );
};
