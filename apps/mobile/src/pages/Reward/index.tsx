import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Linking,
  RefreshControl,
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
import {NAVBAR_HEIGHT} from '@components';
import {useReward} from '@hooks';

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
      if (isRewardRedeemed()) {
        return (
          <>
            {code && redeem_url && (
              <InstructionsContainer>
                <Text appearance={'primary'} type={'body'}>
                  Redeem this code at{' '}
                  <TouchableText onPress={() => openUrl(redeem_url)}>
                    {redeem_url}
                  </TouchableText>
                </Text>
              </InstructionsContainer>
            )}

            {code && (
              <Card>
                <TouchHandler
                  animationType={'opacityWithScale'}
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 22,
                  }}
                  onPress={() => copyToClipboard('FITBUCKS10')}
                  disabled={!code}>
                  <Text appearance={'primary'} bold style={{fontSize: 22}}>
                    {code}
                  </Text>
                </TouchHandler>
              </Card>
            )}

            <View style={{alignItems: 'center'}}>
              <Text type={'caption'} style={{marginTop: 10}}>
                {redeem_instructions
                  ? redeem_instructions
                  : code
                  ? 'Tap code to copy to clipboard'
                  : ''}
              </Text>
            </View>
          </>
        );
      }

      if (isRewardUnclaimed()) {
        return (
          <>
            <Button onPress={handleClaim} disabled={isClaiming}>
              {isClaiming ? (
                <ActivityIndicator color={typography.button.color} />
              ) : (
                <Text
                  type={'subheading'}
                  bold
                  style={{color: typography.button.color}}>
                  Claim This Reward
                </Text>
              )}
            </Button>

            <View style={{alignItems: 'center'}}>
              <Text type={'caption'} style={{marginTop: 10}}>
                Your points balance will be {currentPoints - points_required}{' '}
                after claiming this reward
              </Text>
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
            <Text appearance={'secondary'} style={{textAlign: 'center'}}>
              You need{' '}
              <Text appearance={'accent'}>
                {points_required - currentPoints}
              </Text>{' '}
              more points to claim this reward
            </Text>
          </View>
        </Card>
      );
    } else {
      return (
        <Text appearance={'primary'} style={{textAlign: 'center'}}>
          This code expired on {expires.format('Do MMMM YYYY')}
        </Text>
      );
    }
  };

  return (
    <>
      <AnimatedHeader {...{scrollAnim, title: title_short}} />

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
                uri: photo_url,
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
                        isRewardUnclaimed() || isRewardRedeemed() || isExpired
                          ? 1
                          : currentPoints / points_required
                      }
                      text={`${points_required} points`}
                      disabled={true}
                    />

                    {!isRewardRedeemed() && !isRewardUnclaimed() && !isExpired && (
                      <Text
                        style={{marginLeft: 5, fontSize: 10}}
                        type={'caption'}
                        appearance={'primary'}
                        bold>
                        {points_required - currentPoints} points remaining
                      </Text>
                    )}
                  </Row>
                  <Text type={'body'} appearance={'primary'} bold>
                    {brand}
                  </Text>
                  <Text type={'title'} appearance={'primary'} numberOfLines={2}>
                    {title_short}
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: 'flex-end',
                    marginLeft: 10,
                    flex: 1,
                  }}>
                  <Text
                    type={'caption'}
                    appearance={'primary'}
                    style={{textAlign: 'right'}}>
                    {isExpired
                      ? `Expired on ${expires.format('Do MMMM YYYY')}`
                      : `Expires at ${expires.format('Do MMMM YYYY')}`}
                  </Text>
                </View>
              </Row>
            </HeaderContent>
          </HeaderContainer>
        </Animated.View>

        <ContentContainer>
          <Text type={'subheading'}>{title}</Text>
          <Text style={{marginTop: 10, marginBottom: 20}}>{description}</Text>

          {renderContent()}
        </ContentContainer>
      </Animated.ScrollView>
      <SnackBar
        visible={snackbarVisible}
        textMessage={`Code was copied to your clipboard`}
        containerStyle={{
          paddingBottom: insets.bottom,
        }}
        backgroundColor={colors.accent}
        messageColor={colors.chartUnfilled}
        messageStyle={{fontFamily: fonts.bold}}
      />
    </>
  );
};
