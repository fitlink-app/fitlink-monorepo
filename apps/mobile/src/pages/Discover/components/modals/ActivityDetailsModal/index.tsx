import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated';
import styled, {useTheme} from 'styled-components/native';
import {Handle, ModalBackground} from '../components';
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
import {Dimensions, FlatList, Linking, View} from 'react-native';
import {NativeViewGestureHandler} from 'react-native-gesture-handler';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const imageHeight = SCREEN_WIDTH * 0.4;
const imageWidth = SCREEN_WIDTH / 2.5;

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
  marginTop: 15,
});

const SectionContent = styled.View({marginTop: 5});

const CarouselImage = styled.Image({
  borderRadius: 10,
  height: imageHeight,
  width: imageWidth,
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
  onBack?: () => void;
}

export const ActivityDetailsModal = React.forwardRef<
  BottomSheetModal,
  ActivityDetailsModalProps
>(({onBack, ...rest}, ref) => {
  const {colors} = useTheme();

  const [contentHeight, setContentHeight] = useState(0);
  const snapPoints = useMemo(
    () => ['30%', contentHeight + HANDLE_HEIGHT],
    [contentHeight],
  );

  // TEMP

  const activity: any = {
    name: 'Activity Name',
    activity: 'Yoga',
    date: '6pm every Friday',
    cost: '$9.90',
    organizer_email: 'hurka@gyuri.com',
    description: 'Best fitness class ever.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518644961665-ed172691aaa1?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        alt: 'Fuiyooh',
      },
      {
        url: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        alt: 'Back Pain',
      },
      {
        url: 'https://images.unsplash.com/photo-1614633757718-1c8380011b9b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=932&q=80',
        alt: 'Huehuehue',
      },
    ],
    organizer_name: 'Hurka Gyurka',
    organizer_image:
      'https://images.unsplash.com/photo-1571512599285-9ac4fdf3dba9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
    organizer_url: 'Fitness 3000',
  };

  // Refs
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

  const handleOnDirectionsPressed = () => {
    // TODO: Handle open map
  };

  const handleOnContactPressed = () => {
    // TODO: Open contacts modal (email/phone)
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
              paddingTop: 4,
              paddingBottom: 12,
            }}>
            <Icon name={'arrow-left'} size={24} color={colors.accent} />
            <Label
              type={'subheading'}
              appearance={'primary'}
              style={{marginLeft: 8}}>
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
          Event Organizer
        </Label>

        <SectionContent>
          <Row style={{justifyContent: 'flex-start', alignItems: 'center'}}>
            {!!organizer_image && <Avatar url={organizer_image} size={84} />}

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

    return (
      <>
        {/* Render Top Section */}
        <ContentContainer>
          <Section>
            <Row>
              <Label
                type={'title'}
                bold
                style={{flexShrink: 1, paddingRight: 10}}>
                {activity.name}
              </Label>
              <Label style={{flexShrink: 1, textAlign: 'right'}}>
                {activity.activity}
              </Label>
            </Row>

            <Row style={{marginTop: 5}}>
              <Label appearance={'accent'} style={{flexShrink: 1}}>
                {activity.date}
              </Label>
              <Label appearance={'accentSecondary'}>{activity.cost}</Label>
            </Row>
          </Section>

          <Section>
            <Row>
              <Button
                style={{flex: 1}}
                containerStyle={{
                  minWidth: undefined,
                  borderColor: colors.accentSecondary,
                }}
                textStyle={{color: colors.accentSecondary}}
                type={'default'}
                outline
                text={'Get Directions'}
                onPress={handleOnDirectionsPressed}
              />

              {(!!activity.organizer_email ||
                !!activity.organizer_telephone) && (
                <Row style={{flex: 1}}>
                  <View style={{width: 10}} />

                  <Button
                    style={{flex: 1}}
                    containerStyle={{
                      minWidth: undefined,
                    }}
                    text={'Contact'}
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
            <Label type={'subheading'} bold>
              {activity.name}
            </Label>

            <SectionContent>
              <Label>{activity.description}</Label>
            </SectionContent>
          </Section>

          {renderOrganizerDetails()}
        </ContentContainer>
      </>
    );
  };

  return (
    <>
      <BottomSheetModal
        {...{...rest, ref, handleComponent}}
        index={0}
        handleHeight={200}
        snapPoints={snapPoints}
        animatedIndex={animatedIndex}
        enablePanDownToClose={true}
        backgroundComponent={ModalBackground}
        backdropComponent={renderModalBackdrop}>
        <BottomSheetScrollView
          ref={scrollViewRef}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="never"
          style={scrollViewStyle}>
          <BottomSheetView onLayout={handleOnLayout}>
            {renderContent()}
          </BottomSheetView>
        </BottomSheetScrollView>
      </BottomSheetModal>
      <Lightbox ref={lightboxRef} />
    </>
  );
});
