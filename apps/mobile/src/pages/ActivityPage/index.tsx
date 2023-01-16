import {Navbar} from '@components';
import {useHealthActivity, useMe} from '@hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  View,
} from 'react-native';
import {RootStackParamList} from 'routes/types';
import styled from 'styled-components/native';
import {Avatar, Icon, Label, TouchHandler} from '../../components/common';
import {ActivityCarousel} from './components/ActivityCarousel';
import {ActivityMap} from './components/ActivityMap';
import {useActivityCamera} from './hooks/useActivityCamera';
import {useActivityInfoData} from './hooks/useActivityInfoData';

const SDetails = styled.View({
  position: 'absolute',
  top: 59,
  right: 23,
  alignItems: 'flex-end',
});

const DetailName = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  textAlign: 'right',
  fontSize: 14,
  opacity: 0.8,
});

const DetailValue = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
  appearance: 'accent',
}))({
  textAlign: 'right',
  fontSize: 16,
  marginBottom: 4,
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

const SRow = styled.View({
  flexDirection: 'row',
  marginTop: 8,
});

const UserName = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontSize: 20,
  lineHeight: 27,
});

const UserDate = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontSize: 17,
  lineHeight: 27,
  opacity: 0.7,
});

const ShareIcon = styled.Image({});

// Carousal Component
export const ActivityPage = (
  props: StackScreenProps<RootStackParamList, 'ActivityPage'>,
) => {
  const [areInteractionsDone, setInteractionsDone] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const {id} = props.route.params;

  const {data: user} = useMe({
    refetchOnMount: false,
  });

  const {data} = useHealthActivity(id, areInteractionsDone);

  const {
    distance,
    speed,
    elevation,
    calories,
    time,
    title,
    images,
    date,
    userName,
  } = useActivityInfoData(data, user);

  const {
    handleOnSharePressed,
    handleOnImageOptionsPressed,
    handleOnImagePickerPressed,
    isShareActivityLoading,
    isUploadingImage,
    isAddingHealthActivityImage,
  } = useActivityCamera(data, selectedIndex);

  const isOwnedActivity = data?.user.id === user?.id;
  if (!data) {
    return null;
  }
  return (
    <ScrollView>
      <Navbar iconColor="white" />
      <ActivityCarousel
        images={images}
        title={title || ''}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}>
        <SDetails>
          <DetailName>Distance</DetailName>
          <DetailValue>{distance} mi</DetailValue>
          <DetailName>Speed</DetailName>
          <DetailValue>{speed}</DetailValue>
          <DetailName>Calories</DetailName>
          <DetailValue>{calories}</DetailValue>
          <DetailName>Time</DetailName>
          <DetailValue>{time} m</DetailValue>
          <DetailName>Elevation Gain</DetailName>
          <DetailValue>{elevation} ft</DetailValue>
          <SRow>
            {!!images.length && isOwnedActivity && (
              <Icon
                name={'ellipsis'}
                color={'white'}
                size={26}
                onPress={handleOnImageOptionsPressed}
              />
            )}

            {isOwnedActivity && (
              <Icon
                name={'camera'}
                style={{
                  marginLeft: 12,
                }}
                size={26}
                color={'white'}
                isLoading={isAddingHealthActivityImage || isUploadingImage}
                disabled={isAddingHealthActivityImage || isUploadingImage}
                onPress={handleOnImagePickerPressed}
              />
            )}
          </SRow>
        </SDetails>
      </ActivityCarousel>
      <UserSection>
        <UserProfile>
          <Avatar size={76} radius={18} url={data?.user.avatar?.url_512x512} />
          <UserInfo>
            <UserName>{userName}</UserName>
            <UserDate>{date}</UserDate>
          </UserInfo>
        </UserProfile>
        {isOwnedActivity && (
          <TouchHandler onPress={handleOnSharePressed}>
            {isShareActivityLoading ? (
              <View
                style={{
                  height: 24,
                  width: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ActivityIndicator color="white" />
              </View>
            ) : (
              <ShareIcon
                source={require('../../../assets/images/icon/share-2.png')}
              />
            )}
          </TouchHandler>
        )}
      </UserSection>
      <ActivityMap polyline={data?.polyline} />
    </ScrollView>
  );
};
