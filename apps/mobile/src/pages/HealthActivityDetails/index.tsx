import {Avatar, Dots, Icon, Label, Navbar, TouchHandler} from '@components';
import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  StyleSheet,
  Image,
  View,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatWidget} from './components';
import {useNavigation} from '@react-navigation/native';
import {
  formatDistanceShortLocale,
  getActivityDistance,
  getBounds,
  getSpeedValue,
} from '@utils';
import Polyline from '@mapbox/polyline';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from 'routes/types';
import {useHealthActivity, useMe, useShareHealthActivity} from '@hooks';
import {formatRelative, formatDistanceStrict} from 'date-fns';
import locale from 'date-fns/locale/en-US';
import {getErrorMessage} from '@fitlink/api-sdk';

const {MapView, LineLayer, ShapeSource, Camera} = MapboxGL;

// Make the camera fit the bounds
const MAP_ANIMATION_DURATION = 500;
const MAP_BOUNDS_PADDING = 40;

const HeaderContainer = styled.View({
  width: '100%',
  height: 250,
});

const HeaderContent = styled.View({
  flex: 1,
  ...StyleSheet.absoluteFillObject,
  margin: 15,
});

const HeaderImage = styled(Image)({
  width: '100%',
  height: 250,
});

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000004D', '#00000099'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const ContentContainer = styled.View({
  marginHorizontal: 20,
});

const StatsContainer = styled.View({
  marginTop: 20,
});

const StatWidgetRow = styled.View({flexDirection: 'row'});

export const HealthActivityDetails = (
  props: StackScreenProps<RootStackParamList, 'HealthActivityDetails'>,
) => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const navigation = useNavigation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [areInteractionsDone, setInteractionsDone] = useState(false);

  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;
  const cameraRef = useRef() as React.MutableRefObject<MapboxGL.Camera>;

  const scrollAnim = useRef(new Animated.Value(0)).current;

  const {id} = props.route.params;

  const {data: user} = useMe({
    refetchOnMount: false,
  });

  const {
    data,
    isFetchedAfterMount: isHealthActivityFetchedAfterMount,
    refetch: refetchHealthActivity,
  } = useHealthActivity(id, areInteractionsDone);

  const {mutateAsync: generateShareableContent} = useShareHealthActivity();

  const distance =
    user && data?.distance
      ? (getActivityDistance(user.unit_system, data.distance, {
          short: true,
        }) as string)
      : undefined;

  const durationInSeconds = data
    ? (new Date(data.start_time).valueOf() -
        new Date(data.end_time).valueOf()) /
      1000
    : undefined;

  const speed =
    data?.distance && user && durationInSeconds
      ? (getSpeedValue(
          data.sport?.name_key,
          data.distance,
          durationInSeconds,
          user.unit_system,
        ) as string)
      : undefined;

  const points = data?.points.toString();

  const calories = data?.calories.toString();

  const time = data
    ? formatDistanceStrict(new Date(data.start_time), new Date(data.end_time), {
        locale: {
          ...locale,
          formatDistance: formatDistanceShortLocale,
        },
      })
    : undefined;

  const polyline = data?.polyline;

  const userName = data?.user.name;

  const userAvatarUrl = data?.user.avatar?.url_512x512;

  const isOwnedActivity = data?.user.id === user?.id;

  // TEMP
  const isHealthActivityImageUploading = false;

  const scrollAnimInterpolated = scrollAnim.interpolate({
    inputRange: [-500, 0],
    outputRange: [-500, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setInteractionsDone(true);
    });
  }, []);

  const getDefaultActivityImage = () => {
    return undefined;
  };

  const handleOnImagePickerPressed = () => {};

  const handleOnImageOptionsPressed = () => {};

  const handleOnSharePressed = async () => {
    if (!data) return;
    console.log(data);
    try {
      const hurka = await generateShareableContent({
        activityId: data?.id,
      });

      console.log('hurka');
      console.log(hurka);
    } catch (e) {
      console.log('e: ', e);
      console.log(getErrorMessage(e));
    }
  };

  const renderRoute = () => {
    if (!polyline) return null;

    const route = Polyline.toGeoJSON(polyline);
    const polyLatLngs = route.coordinates.map(x => ({
      lat: x[1],
      lng: x[0],
    }));

    const bounds = getBounds(polyLatLngs);

    return (
      <TouchHandler onPress={() => navigation.navigate('Route', {polyline})}>
        <MapView
          style={{height: 250}}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          logoEnabled={false}
          ref={mapViewRef}>
          <Camera
            ref={cameraRef}
            defaultSettings={{
              animationDuration: MAP_ANIMATION_DURATION,
              bounds: {
                ...bounds,
                paddingLeft: MAP_BOUNDS_PADDING,
                paddingRight: MAP_BOUNDS_PADDING,
                paddingTop: MAP_BOUNDS_PADDING,
                paddingBottom: MAP_BOUNDS_PADDING,
              },
            }}
          />
          <ShapeSource
            id={'route'}
            shape={{
              type: 'Feature',
              geometry: route,
              properties: {},
            }}>
            <LineLayer
              id={'lineroute'}
              style={{
                lineCap: 'round',
                lineWidth: 4.5,
                lineOpacity: 0.84,
                lineColor: '#FB5202',
              }}
            />
          </ShapeSource>
        </MapView>
      </TouchHandler>
    );
  };

  return (
    <>
      <Navbar
        scrollAnimatedValue={scrollAnim}
        title={data?.title || 'Loading activity...'}
        iconColor={'white'}
        overlay
        titleProps={{
          type: 'title',
          bold: false,
        }}
      />

      {!data ? (
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <Animated.ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
            {useNativeDriver: true},
          )}>
          <Animated.View
            style={{
              transform: [{translateY: scrollAnimInterpolated}],
            }}>
            <HeaderContainer>
              {!!data.images.length ? (
                <PagerView
                  style={{flex: 1}}
                  initialPage={0}
                  onPageSelected={({nativeEvent: {position}}) =>
                    setCurrentImageIndex(position)
                  }>
                  {data.images.map(({id, url_640x360}, index) => {
                    return (
                      <View key={url}>
                        <HeaderImage
                          resizeMode={'cover'}
                          source={{
                            uri: url,
                          }}
                        />
                      </View>
                    );
                  })}
                </PagerView>
              ) : (
                <HeaderImage
                  resizeMode={'cover'}
                  source={{
                    uri: getDefaultActivityImage(),
                  }}
                />
              )}
              <ImageOverlay pointerEvents={'none'} />
              <HeaderContent pointerEvents={'box-none'}>
                <View
                  pointerEvents={'none'}
                  style={{
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                  <Avatar size={60} url={userAvatarUrl} />
                  <Label type={'title'} style={{marginVertical: 5}}>
                    {userName}
                  </Label>
                  {!!data.images.length && (
                    <Dots
                      amount={data.images.length}
                      current={currentImageIndex}
                      size={4}
                    />
                  )}
                </View>
                {isOwnedActivity && (
                  <Icon
                    name={'camera'}
                    size={26}
                    color={'white'}
                    style={{position: 'absolute', right: 0, bottom: 0}}
                    onPress={handleOnImagePickerPressed}
                  />
                )}

                {!!data.images.length &&
                  isOwnedActivity &&
                  !isHealthActivityImageUploading && (
                    <Icon
                      name={'ellipsis'}
                      color={'white'}
                      size={26}
                      onPress={handleOnImageOptionsPressed}
                      style={{position: 'absolute', right: 0, top: insets.top}}
                    />
                  )}
              </HeaderContent>
            </HeaderContainer>
          </Animated.View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 20,
              marginTop: 10,
              marginBottom: polyline ? 10 : 0,
            }}>
            <View>
              <Label type={'title'}>{data.title}</Label>
              <Label type="caption" style={{marginTop: 5}}>
                {formatRelative(new Date(new Date(data.end_time)), new Date(), {
                  locale: {
                    ...locale,
                    formatRelative: token => {
                      const formattings: {[key: string]: string} = {
                        lastWeek: "EEEE 'at' h:mm a",
                      };

                      return (
                        formattings[token] ||
                        (locale.formatRelative && locale.formatRelative(token))
                      );
                    },
                  },
                })}
              </Label>
            </View>
            <Icon
              name={'share'}
              size={20}
              color={'white'}
              onPress={handleOnSharePressed}
              disabled={false}
            />
          </View>

          {renderRoute()}

          <ContentContainer>
            <StatsContainer>
              <StatWidgetRow
                style={{
                  paddingBottom: 10,
                  borderBottomWidth: 1,
                  borderColor: colors.separator,
                }}>
                <StatWidget label={'Distance'} value={distance} />
                <StatWidget label={'Speed'} value={speed} />
                <StatWidget label={'Points'} value={points} />
              </StatWidgetRow>

              <StatWidgetRow style={{marginTop: 10}}>
                <StatWidget label={'Calories'} value={calories} />
                <StatWidget label={'Time'} value={time} />
              </StatWidgetRow>
            </StatsContainer>
          </ContentContainer>
          <View style={{flex: 1}} />
        </Animated.ScrollView>
      )}
    </>
  );
};
