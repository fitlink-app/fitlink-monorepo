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
import {
  Button,
  Card,
  Chip,
  Label,
  Navbar,
  NAVBAR_HEIGHT,
  TouchHandler,
} from '@components';
import {useClaimReward, useMe, useReward} from '@hooks';
import {format} from 'date-fns';
import { BlurView } from '@react-native-community/blur';

const Wrapper = styled.View({
  paddingHorizontal: 10,
  marginTop: 47
});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

const HeaderContainer = styled.View({
  width: '100%',
  height: 434,
  borderRadius: 30,
  overflow: 'hidden'
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const HeaderImage = styled(Image)({
  position: 'absolute',
  width: '100%',
  resizeMode: 'stretch',
  height: 434,
});

const TitleContainer = styled.View({
  position: 'relative',
  width: '100%',
  height: 86,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
});

const HeaderContent = styled.View({
  position: 'relative',
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
});

const PageTitle = styled(Label).attrs(() => ({
  children: 'GOLD REWARD'
}))({
  fontSize: 18,
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  border: 0,
  opacity: 0.2,
});

const ContentContainer = styled.View({
  marginTop: 28,
  paddingHorizontal: 10,
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

  const {colors, fonts} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const {data: user} = useMe();

  const {data: reward} = useReward(id);

  const {mutateAsync: claimReward, isLoading: isClaiming} = useClaimReward();

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

  if (!reward || !user) {
    return (
      <EmptyContainer style={{marginTop: -(NAVBAR_HEIGHT + insets.top)}}>
        <ActivityIndicator color={colors.accent} />
      </EmptyContainer>
    );
  }

  const isExpired = new Date() > new Date(reward.reward_expires_at);
  const restDays = !isExpired ? Math.ceil(Math.abs((new Date(reward.reward_expires_at)).getTime()-(new Date()).getTime())/(1000*3600*24)) : 0;

  const expiryDateFormatted = format(
    new Date(reward.reward_expires_at),
    'do MMMM yyyy',
  );

  const scrollAnimInterpolated = scrollAnim.interpolate({
    inputRange: [-500, 0],
    outputRange: [-500, 0],
    extrapolate: 'clamp',
  });

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
    return reward && reward.points_required <= user!.points_total;
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
            <Button
              text={'Claim Reward'}
              textStyle={{
                fontSize: 14,
                textTransform: 'uppercase',
                fontWeight: '500'
              }}
              containerStyle={{
                width: 134,
                backgroundColor: '#00E9D7',
                borderRadius: 12
              }}
              onPress={() => claimReward(id)}
              disabled={isClaiming}
              loading={isClaiming}
            />

            {/* <View style={{alignItems: 'center'}}>
              <Label type={'caption'} style={{marginTop: 10}}>
                Your points balance will be{' '}
                {user!.points_total - reward.points_required} after claiming
                this reward
              </Label>
            </View> */}
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
                {reward.points_required - user!.points_total}
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
    <Wrapper>
      <Animated.ScrollView
        bounces={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
          {useNativeDriver: true},
        )}>
        <View style={{marginLeft: 5}}>
          <Navbar iconColor={'white'} />
        </View>
        <HeaderContainer>
          <HeaderImage source={require('../../../assets/images/rewards/reward-background.png')} />
          <BlurView 
            style={{
              position: "absolute",
              width: '100%',
              height: 86,
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}
            blurRadius={1}
            overlayColor={'transparent'}
          />
          <TitleContainer><PageTitle /></TitleContainer>
          <Line />
        </HeaderContainer>
        <HeaderContent>
          <Row style={{marginTop: 40}}>
            <View style={{flex: 2}}>
              <Label
                type={'subheading'}
                appearance={'accent'}
              >
                {isExpired
                  ? `Expired on ${expiryDateFormatted}`
                  : `${restDays} DAYS LEFT`}
              </Label>
              <Label
                type={'title'}
                appearance={'primary'}
                numberOfLines={2}
                style={{
                  marginTop: 21,
                  fontSize: 32,
                  textTransform: 'capitalize'
                }}
              >
                {reward.name_short}
              </Label>
            </View>
            <View
              style={{
                justifyContent: 'center',
                marginTop: 20,
                marginLeft: 10,
                flex: 1,
              }}
            >
              <Chip
                textStyle={{
                  fontFamily: 'Roboto',
                  fontSize: 15,
                  lineHeight: 16,
                  letterSpacing: 2,
                  color: colors.chartUnfilled,
                  textAlign: 'center'
                }}
                style={{backgroundColor: colors.text}}
                progress={
                  isRewardUnclaimed() || reward.redeemed || isExpired
                    ? 1
                    : user!.points_total / reward.points_required
                }
                text={`${reward.points_required} $BFIT`}
                disabled={true}
              />
            </View>
          </Row>
        </HeaderContent>

        <ContentContainer>
          <Label style={{fontSize: 18, lineHeight: 23, color: '#ACACAC'}}>
            Win! You’ve unlocked your reward. Claim the 20% discount reward and redeem it on Nike.com
          </Label>
          <Label style={{marginTop: 33, marginBottom: 82, opacity: 0.5}}>
            This reward can only be used on the online store. Please keep in mind that you have only {restDays} days left to redeem it.
          </Label>

          <View style={{marginBottom: 20}}>
            {renderContent()}
          </View>
        </ContentContainer>
      </Animated.ScrollView>

      {/* // TODO: Fix snackbar props */}
      <SnackBar
        visible={snackbarVisible}
        textMessage={`Code was copied to your clipboard`}
        // @ts-ignore
        containerStyle={{
          paddingBottom: insets.bottom,
        }}
        backgroundColor={colors.accent}
        messageColor={colors.chartUnfilled}
        messageStyle={{fontFamily: fonts.bold}}
      />
    </Wrapper>
  );
};
