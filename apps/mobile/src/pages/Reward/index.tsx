import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  StyleSheet,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SnackBar from 'react-native-snackbar-component';
import Clipboard from '@react-native-community/clipboard';
import styled, {useTheme} from 'styled-components/native';
import {StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from 'routes/types';
import {Card, Chip, Label, NAVBAR_HEIGHT, TouchHandler} from '@components';
import {useReward} from '@hooks';
import {format} from 'date-fns';

const HEADER_HEIGHT = 250;

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const HeaderContainer = styled.View({
  width: '100%',
  height: HEADER_HEIGHT,
});

const HeaderContent = styled.View({
  flex: 1,
  ...StyleSheet.absoluteFillObject,
  margin: 20,
  justifyContent: 'flex-end',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const HeaderImage = styled(Image)({
  width: '100%',
  height: HEADER_HEIGHT,
});

const ContentContainer = styled.View({
  margin: 20,
});

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000004D', '#00000099'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const InstructionsContainer = styled.View({
  marginBottom: 10,
  alignItems: 'center',
});

async function openUrl(url: string) {
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  }
}

export const Reward = (
  props: StackScreenProps<RootStackParamList, 'Reward'>,
) => {
  const {id} = props.route.params;

  const {colors, fonts, typography} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const {
    data: reward,
    isFetchedAfterMount: isRewardFetchedAfterMount,
    refetch: refetchReward,
    isFetching: isFetchingReward,
  } = useReward(id);

  console.log(reward);

  // TODO: Remove
  // TEMP VARIABLES
  const currentPoints = 0;

  const scrollAnim = useRef(new Animated.Value(0)).current;
  let snackbarTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onFocusListener = navigation.addListener('focus', () => {
      if (snackbarVisible) setSnackbarVisible(false);
    });

    const onBlurListener = navigation.addListener('blur', () => {
      if (snackbarTimer.current) clearTimeout(snackbarTimer.current);
    });

    return () => {
      onFocusListener();
      onBlurListener();
    };
  }, [navigation]);

  if (!reward) {
    return (
      <EmptyContainer style={{marginTop: -(NAVBAR_HEIGHT + insets.top)}}>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  }

  const isExpired = new Date() > reward.reward_expires_at;

  const expiryDateFormatted = format(
    new Date(reward.reward_expires_at),
    'do MMMM yyyy',
  );

  const scrollAnimInterpolated = scrollAnim.interpolate({
    inputRange: [-500, 0],
    outputRange: [-500, 0],
    extrapolate: 'clamp',
  });

  const handleClaim = async () => {
    setIsClaiming(true);
    // TODO: Implement claiming reward
    setIsClaiming(false);
  };

  const copyToClipboard = (code: string) => {
    Clipboard.setString(code);
    if (snackbarTimer.current) clearTimeout(snackbarTimer.current);

    setSnackbarVisible(true);

    snackbarTimer.current = setTimeout(() => {
      setSnackbarVisible(false);
    }, 1500);
  };

  /** returns true if the user has more points than the reward's requirement */
  function isRewardUnclaimed() {
    return reward && reward.points_required <= currentPoints;
  }

  const renderContent = () => {
    if (!isExpired) {
      if (reward.redeemed) {
        return (
          <>
            {reward.code && reward.redeem_url && (
              <InstructionsContainer>
                <Label appearance={'primary'} type={'body'}>
                  Redeem this code at{' '}
                  <Label onPress={() => openUrl(reward.redeem_url)}>
                    {reward.redeem_url}
                  </Label>
                </Label>
              </InstructionsContainer>
            )}

            {reward.code && (
              <Card>
                <TouchHandler
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 22,
                  }}
                  onPress={() => copyToClipboard(reward.code)}
                  disabled={!reward.code}>
                  <Label appearance={'primary'} bold style={{fontSize: 22}}>
                    {reward.code}
                  </Label>
                </TouchHandler>
              </Card>
            )}

            <View style={{alignItems: 'center'}}>
              <Label type={'caption'} style={{marginTop: 10}}>
                {reward.redeem_instructions
                  ? reward.redeem_instructions
                  : reward.code
                  ? 'Tap code to copy to clipboard'
                  : ''}
              </Label>
            </View>
          </>
        );
      }

      if (isRewardUnclaimed()) {
        return (
          <>
            {/* // TODO: Button */}

            {/* <Button onPress={handleClaim} disabled={isClaiming}>
              {isClaiming ? (
                <ActivityIndicator color={typography.button.color} />
              ) : (
                <Label
                  type={'subheading'}
                  bold
                  style={{color: typography.button.color}}>
                  Claim This Reward
                </Label>
              )}
            </Button> */}

            <View style={{alignItems: 'center'}}>
              <Label type={'caption'} style={{marginTop: 10}}>
                Your points balance will be{' '}
                {currentPoints - reward.points_required} after claiming this
                reward
              </Label>
            </View>
          </>
        );
      }

      return (
        <Card>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 22,
              paddingHorizontal: 10,
            }}>
            <Label appearance={'secondary'} style={{textAlign: 'center'}}>
              You need{' '}
              <Label appearance={'accent'}>
                {reward.points_required - currentPoints}
              </Label>{' '}
              more points to claim this reward
            </Label>
          </View>
        </Card>
      );
    } else {
      return (
        <Label appearance={'primary'} style={{textAlign: 'center'}}>
          This code expired on {expiryDateFormatted}
        </Label>
      );
    }
  };

  return (
    <>
      {/* // TODO: Navbar */}

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
            <HeaderImage
              resizeMode={'cover'}
              source={{
                uri: reward.image.url_640x360,
              }}
            />
            <ImageOverlay />
            <HeaderContent>
              <Row>
                <View style={{flex: 2}}>
                  <Row
                    style={{
                      alignItems: 'center',
                      marginBottom: 20,
                      justifyContent: 'flex-start',
                    }}>
                    <Chip
                      textStyle={{
                        fontFamily: fonts.bold,
                        color: colors.chartUnfilled,
                      }}
                      style={{backgroundColor: 'rgba(255,255,255,.5)'}}
                      progress={
                        isRewardUnclaimed() || reward.redeemed || isExpired
                          ? 1
                          : currentPoints / reward.points_required
                      }
                      text={`${reward.points_required} points`}
                      disabled={true}
                    />

                    {!reward.redeemed && !isRewardUnclaimed() && !isExpired && (
                      <Label
                        style={{marginLeft: 5, fontSize: 10}}
                        type={'caption'}
                        appearance={'primary'}
                        bold>
                        {reward.points_required - currentPoints} points
                        remaining
                      </Label>
                    )}
                  </Row>
                  <Label type={'body'} appearance={'primary'} bold>
                    {reward.brand}
                  </Label>
                  <Label
                    type={'title'}
                    appearance={'primary'}
                    numberOfLines={2}>
                    {reward.name_short}
                  </Label>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                    marginLeft: 10,
                    flex: 1,
                  }}>
                  <Label
                    type={'caption'}
                    appearance={'primary'}
                    style={{textAlign: 'right'}}>
                    {isExpired
                      ? `Expired on ${expiryDateFormatted}`
                      : `Expires at ${expiryDateFormatted}`}
                  </Label>
                </View>
              </Row>
            </HeaderContent>
          </HeaderContainer>
        </Animated.View>

        <ContentContainer>
          <Label type={'subheading'}>{reward.name}</Label>
          <Label style={{marginTop: 10, marginBottom: 20}}>
            {reward.description}
          </Label>

          {renderContent()}
        </ContentContainer>
      </Animated.ScrollView>

      {/* // TODO: Fix snackbar props */}
      <SnackBar
        visible={snackbarVisible}
        textMessage={`Code was copied to your clipboard`}
        // containerStyle={{
        //   paddingBottom: insets.bottom,
        // }}
        backgroundColor={colors.accent}
        messageColor={colors.chartUnfilled}
        // messageStyle={{fontFamily: fonts.bold}}
      />
    </>
  );
};
