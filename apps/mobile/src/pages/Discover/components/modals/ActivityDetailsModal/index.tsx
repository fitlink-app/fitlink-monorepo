import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
  useBottomSheetModal,
} from '@gorhom/bottom-sheet';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import {Handle, ModalBackground, ActivityItem} from '../components';
import {BottomSheetScrollViewMethods} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import {
  Avatar,
  Button,
  Icon,
  Label,
  Lightbox,
  LightboxHandles,
  TouchHandler,
} from '@components';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Linking,
  Platform,
  View,
} from 'react-native';
import LaunchNavigator from 'react-native-launch-navigator';
import {NativeViewGestureHandler} from 'react-native-gesture-handler';
import {useActivity, useModal} from '@hooks';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useEffect} from 'react';
import {Dialog, DialogButton} from 'components/modal';
import {getDistanceFromLatLonInKm} from '@utils';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const DETAILS_MODAL_KEY = 'DETAILS_MODAL_KEY';

const imageHeight = SCREEN_WIDTH * 0.5;
const imageWidth = SCREEN_WIDTH * 0.8;

const HANDLE_HEIGHT = 80;

const AboveContentContainer = styled.View({paddingHorizontal: 16});

const Separator = styled.View({
  borderBottomWidth: 0.5,
  borderColor: 'rgba(255,255,255,.15)',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const ContentContainer = styled.View({
  paddingHorizontal: 15,
});

const Section = styled.View({
  marginTop: 30,
});

const SectionContent = styled.View({marginTop: 5});

const CarouselImage = styled.Image({
  borderRadius: 24,
  height: imageHeight,
  width: imageWidth,
});

const EmptyContainer = styled.View({
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
});

interface ActivityDetailsModalProps
  extends Omit<
    BottomSheetModalProps,
    | 'children'
    | 'snapPoints'
    | 'index'
    | 'handleHeight'
    | 'enablePanDownToClose'
    | 'backgroundComponent'
    | 'backdropComponent'
  > {
  activityId?: string;
  onBack?: () => void;
}

export const ActivityDetailsModal = React.forwardRef<
  BottomSheetModal,
  ActivityDetailsModalProps
>(({activityId, onBack, ...rest}, ref) => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();
  const {dismiss} = useBottomSheetModal();
  const {openModal, closeModal} = useModal();

  const {data: activity} = useActivity(activityId);

  const [contentHeight, setContentHeight] = useState(0);
  const snapPoints = useMemo(
    () => (!!activity ? ['90%', contentHeight + HANDLE_HEIGHT] : ['45%']),
    [contentHeight, activity],
  );

  // Refs
  const hadActivityLastRender = useRef(false);
  const carouselRef = useRef<FlatList>(null);
  const lightboxRef = useRef<LightboxHandles>(null);
  const scrollViewRef = useRef<BottomSheetScrollViewMethods>(null);

  // Animations
  const animatedIndex = useSharedValue<number>(0);

  const scrollViewAnimatedStyle = useAnimatedStyle(() => ({
    opacity: animatedIndex.value + 1,
  }));

  const scrollViewStyle = useMemo(
    () => [{flex: 1}, scrollViewAnimatedStyle],
    [scrollViewAnimatedStyle],
  );

  useEffect(() => {
    if (activity) {
      hadActivityLastRender.current = true;
    } else if (hadActivityLastRender.current) {
      dismiss(DETAILS_MODAL_KEY);
    }
  }, [activity]);

  const handleOnDirectionsPressed = () => {
    if (Platform.OS === 'android')
      // TODO: Move Google Maps API key to configs
      // @ts-ignore
      LaunchNavigator.setGoogleApiKey(
        '25:9F:16:C3:EC:5A:37:F7:25:0D:A6:61:4B:80:13:F4:2F:23:8F:08',
      );

    const coords = activity?.meeting_point.coordinates;
    // @ts-ignore
    LaunchNavigator.navigate([coords[0], coords[1]])
      .then(() => console.log('Launched navigator'))
      .catch((err: any) => console.error('Error launching navigator: ' + err));
  };

  const handleOnContactPressed = () => {
    const buttons: DialogButton[] = [];

    if (activity?.organizer_telephone) {
      buttons.push({
        text: 'Phone',
        onPress: () => Linking.openURL(`tel:${activity.organizer_telephone}`),
      });
    }

    if (activity?.organizer_email) {
      buttons.push({
        text: 'E-mail',
        onPress: () => Linking.openURL(`mailto:${activity.organizer_email}`),
      });
    }

    openModal(id => (
      <Dialog
        {...{buttons}}
        title={'Contact'}
        onCloseCallback={() => {
          closeModal(id);
        }}
      />
    ));
  };

  const handleOnLayout = useCallback(
    ({
      nativeEvent: {
        layout: {height},
      },
    }) => {
      setContentHeight(height || 1);
    },
    [],
  );

  const handleComponent = useCallback(
    () => (
      <>
        <Handle />
        <AboveContentContainer>
          <TouchHandler
            onPress={() => onBack && onBack()}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(86, 86, 86, 0.3)',
            }}>
            <Icon name={'arrow-left'} size={20} color={colors.text} />
            <Label appearance={'primary'} style={{marginLeft: 8}}>
              Back
            </Label>
          </TouchHandler>
          <Separator />
        </AboveContentContainer>
      </>
    ),
    [],
  );

  const renderModalBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        pressBehavior={'collapse'}
        enableTouchThrough={true}
        appearsOnIndex={1}
        disappearsOnIndex={0}
      />
    ),
    [],
  );

  const renderCarouselItem = ({
    item,
    index,
  }: {
    item: {url: string; alt: string};
    index: number;
  }) => {
    return (
      <TouchHandler
        onPress={() => {
          carouselRef.current?.scrollToIndex({
            animated: true,
            index,
            viewOffset: imageWidth / 3,
          });

          lightboxRef.current?.open(item.url, item.alt);
        }}
        style={{
          marginRight: index + 1 === activity?.images?.length ? 0 : 10,
        }}>
        <CarouselImage source={{uri: item?.url}} />
      </TouchHandler>
    );
  };

  const renderOrganizerDetails = () => {
    if (!activity) return null;

    const {organizer_name, organizer_image, organizer_url} = activity;

    const isOrganizerAvailable =
      organizer_name || organizer_image || organizer_url;

    if (!isOrganizerAvailable) return null;

    return (
      <Section>
        <Label type={'subheading'} bold style={{marginBottom: 10}}>
          Event Organiser
        </Label>

        <SectionContent>
          <Row style={{justifyContent: 'flex-start', alignItems: 'center'}}>
            {!!organizer_image && (
              <Avatar url={organizer_image.url_512x512} size={84} />
            )}

            <View style={{marginLeft: organizer_image ? 15 : 0}}>
              <Label appearance={'primary'} type={'subheading'} bold>
                {organizer_name}
              </Label>

              {!!organizer_url && (
                <TouchHandler
                  onPress={async () => {
                    let url = organizer_url;

                    if (!/^https?:\/\//i.test(url)) {
                      url = 'http://' + url;
                    }

                    const supported = await Linking.canOpenURL(url);
                    if (supported) {
                      try {
                        await Linking.openURL(url);
                      } catch (e) {
                        console.log(e);
                      }
                    }
                  }}>
                  <Label appearance={'accent'} bold>
                    Visit Website
                  </Label>
                </TouchHandler>
              )}
            </View>
          </Row>
        </SectionContent>
      </Section>
    );
  };

  const renderContent = () => {
    if (!activity) return null;

    // TODO: Use actual user location
    const userLocation = {lat: 51.752022, lng: -1.257677};

    const dist = getDistanceFromLatLonInKm(
      //@ts-ignore
      activity.meeting_point.coordinates[0],
      //@ts-ignore
      activity.meeting_point.coordinates[1],
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
      <>
        {/* Render Top Section */}
        <ContentContainer>
          <ActivityItem
            name={activity.name}
            activityType={activity.activity}
            distance={distanceString}
            date={activity.date}
          />

          <Section>
            <Row>
              <Button
                style={{flex: 1}}
                containerStyle={{
                  width: 160,
                  borderRadius: 12,
                  backgroundColor: colors.text,
                }}
                textStyle={{
                  color: colors.background,
                  fontSize: 14,
                  fontFamily: 'Roboto',
                }}
                type={'default'}
                text={'GET DIRECTION'}
                onPress={handleOnDirectionsPressed}
              />

              {(!!activity.organizer_email ||
                !!activity.organizer_telephone) && (
                <Row style={{flex: 1}}>
                  <View style={{width: 10}} />

                  <Button
                    style={{flex: 1}}
                    containerStyle={{
                      width: 160,
                      borderRadius: 12,
                      backgroundColor: colors.text,
                    }}
                    textStyle={{
                      color: colors.background,
                      fontSize: 14,
                      fontFamily: 'Roboto',
                    }}
                    text={'CONTACT'}
                    onPress={handleOnContactPressed}
                  />
                </Row>
              )}
            </Row>
          </Section>
        </ContentContainer>

        {/* Render Image Gallery */}
        {!!activity?.images?.length && (
          <>
            <ContentContainer>
              <Section>
                <Label type={'subheading'} bold>
                  Gallery
                </Label>
              </Section>
            </ContentContainer>

            <SectionContent>
              <NativeViewGestureHandler disallowInterruption={true}>
                <FlatList
                  contentContainerStyle={{paddingHorizontal: 16}}
                  ref={carouselRef}
                  data={activity.images}
                  renderItem={renderCarouselItem}
                  showsHorizontalScrollIndicator={false}
                  horizontal
                />
              </NativeViewGestureHandler>
            </SectionContent>
          </>
        )}

        {/* Render Bottom Content */}
        <ContentContainer>
          <Section>
            <Label bold>{activity.name}</Label>

            <SectionContent>
              <Label appearance={'secondary'}>{activity.description}</Label>
            </SectionContent>
          </Section>

          {renderOrganizerDetails()}
        </ContentContainer>
      </>
    );
  };

  const renderEmpty = () => {
    return (
      <EmptyContainer>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  };

  return (
    <>
      <BottomSheetModal
        {...{...rest, ref, handleComponent}}
        index={0}
        name={DETAILS_MODAL_KEY}
        handleHeight={90}
        // topInset={insets.top + 50}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        enablePanDownToClose={true}
        backgroundComponent={ModalBackground}
        backdropComponent={renderModalBackdrop}>
        {activity ? (
          <BottomSheetScrollView
            ref={scrollViewRef}
            bounces={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="never"
            style={scrollViewStyle}>
            <BottomSheetView
              onLayout={handleOnLayout}
              style={{paddingBottom: 20}}>
              {renderContent()}
            </BottomSheetView>
          </BottomSheetScrollView>
        ) : (
          renderEmpty()
        )}
      </BottomSheetModal>
      <Lightbox ref={lightboxRef} />
    </>
  );
});
