import {Avatar, Dots, Icon, Label, Navbar, TouchHandler} from '@components';
import React, {useRef, useState} from 'react';
import {Animated, StyleSheet, Image, View} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import PagerView from 'react-native-pager-view';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatWidget} from './components';
import {useNavigation} from '@react-navigation/native';
import {getBounds} from '@utils';
import Polyline from '@mapbox/polyline';
import MapboxGL from '@react-native-mapbox-gl/maps';

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

export const ActivityDetails = () => {
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();
  const navigation = useNavigation();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;
  const cameraRef = useRef() as React.MutableRefObject<MapboxGL.Camera>;

  const scrollAnim = useRef(new Animated.Value(0)).current;

  // TEMP
  const images: Array<{key: string; url: string}> = [];
  const user_avatar_url = undefined;
  const user_name = 'Placeholder Name';
  const isOwned = true;
  const isHealthActivityImageUploading = false;
  const polyline =
    'kpd`IcyoEIE?]Fi@FKAIFOAOBA?MDKAEB[DMDw@FUAYKO?IDMTUDw@Le@?_@BSCEGDq@UOMCMDCNJn@Tb@ZFBBADHPDLRRPFDN@PK@MDECLMHEAV]PIGHEAA@BHGNELOHEVe@Xu@B?@DACBKRe@FIJ]JMJWRo@NSVaA|@gCRs@Je@Vw@FK@MJYFE@H@MD@IFMVFUHIB@?@CAAEJFD@DCDMHKRs@p@{A^s@NSFCDKb@g@BC?@@?PSj@e@~@m@LOHATQNIHIPAFHHh@L`@ZrAr@fCNt@N^Jj@Ld@BHB?HVZxADh@HXVvAAFHLJXP|@HPdBLB?@M?VVhAz@vCHFPAFJFXDJNn@X`A@NLVHj@N^Lj@DHDXFJFV?RLVLn@FBBPJJ^In@CHGR?XC`@BRCHEH@DAT?LEd@?FCL@FEPBFEN@PEL@d@G@GCEHSHE?BB?P`DED?DXzA@Z?BIKGcABEGWD@DLAADAYWEMGo@IQKi@IMY@ABI@OAEBMCUDGAKBk@DKAk@JWBgBDGBk@BGBOAQ[K]Ii@Qc@QaAGKU}@Mw@O[Ki@m@sBEGONEGEACEMu@ECm@mCY{@EYY_AAYW_AE_@Ww@E[GMUyA]yAq@yBkAmEQ}@U{@Sm@ICgAp@CFSJMNSHKLIFIJg@QTE?]f@KFQUWp@GHSn@Uh@EBIGCDGAGFAJYr@C?Mp@KRQ~@CDCAMh@S`@I^C@G^UZKj@M`@GDITSOh@E?@JAHYZ@C@ACL[p@GRUZa@SFO@]LEFE@S^E@GA?GCDIGUYKUCC[IKKYGYOGAMIUEAAB?CDHPPHZH@DPLFP?JAr@Ob@Gb@GBM@LDFBn@Mz@Ed@GNMrAG?D@';

  const scrollAnimInterpolated = scrollAnim.interpolate({
    inputRange: [-500, 0],
    outputRange: [-500, 0],
    extrapolate: 'clamp',
  });

  const getDefaultActivityImage = () => {
    return 'https://reactnativecode.com/wp-content/uploads/2018/02/Default_Image_Thumbnail.png';
  };

  const handleOnImagePickerPressed = () => {};

  const handleOnImageOptionsPressed = () => {};

  const handleOnSharePressed = () => {};

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
        title={'Title Placeholder'}
        iconColor={'white'}
        overlay
        titleProps={{
          type: 'title',
          bold: false,
        }}
      />

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
            {!!images.length ? (
              <PagerView
                style={{flex: 1}}
                initialPage={0}
                onPageSelected={({nativeEvent: {position}}) =>
                  setCurrentImageIndex(position)
                }>
                {images.map(({key, url}, index) => {
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
                <Avatar size={60} url={user_avatar_url} />
                <Label type={'title'} style={{marginVertical: 5}}>
                  {user_name}
                </Label>
                {!!images.length && (
                  <Dots
                    amount={images.length}
                    current={currentImageIndex}
                    size={4}
                  />
                )}
              </View>
              {isOwned && (
                <Icon
                  name={'camera'}
                  size={26}
                  color={'white'}
                  style={{position: 'absolute', right: 0, bottom: 0}}
                  onPress={handleOnImagePickerPressed}
                />
              )}

              {!!images.length &&
                isOwned &&
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
            <Label type={'title'}>Activity Details</Label>
            <Label type="caption" style={{marginTop: 5}}>
              Render End Date here with format
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
              <StatWidget label={'Distance'} value={'3km'} />
              <StatWidget label={'Speed'} value={'14km/h'} />
              <StatWidget label={'Points'} value={'12'} />
            </StatWidgetRow>

            <StatWidgetRow style={{marginTop: 10}}>
              <StatWidget label={'Calories'} value={'23'} />
              <StatWidget label={'Time'} value={'1h 42m'} />
            </StatWidgetRow>
          </StatsContainer>
        </ContentContainer>
        <View style={{flex: 1}} />
      </Animated.ScrollView>
    </>
  );
};
