import {FitButton, Label, Navbar} from '@components';
import {ImageCardBlurSection} from 'components/common/ImageCard';
import {LeaderboardCountback} from 'pages/League/components/LeaderboardCountback';
import React, {useRef} from 'react';
import {
  ImageSourcePropType,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import {useHeaderAnimatedStyles} from '../hooks/useHeaderAnimatedStyles';
import theme from '../../../theme/themes/fitlink';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useJoinLeague} from '@hooks';
import {useLeaveLeague} from '../../../hooks/api/leagues/useLeaveLeague';
import {useNavigation} from '@react-navigation/core';

type HeaderProps = {
  imageSource: ImageSourcePropType;
  scrollAnimatedValue: Animated.SharedValue<number>;
  memberCount: number;
  title: string;
  resetDate: Date;
  repeat: boolean;
  bfitValue?: number;
  description: string;
  onHeightMeasure?: (height: number) => void;
  membership: 'none' | 'member' | 'owner';
  leagueId: string;
};

const BackgroundImage = styled(Animated.Image)({
  resizeMode: 'cover',
  ...StyleSheet.absoluteFillObject,
});

const Title = styled(Label).attrs({
  type: 'title',
})({
  marginBottom: 7,
  fontSize: 32,
});

const MemberCounts = styled(Label).attrs(() => ({
  appearance: 'accent',
  bold: true,
}))({
  fontSize: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 8,
});

const ImageContainer = styled(Animated.View)({
  width: '100%',
});

const BlurSection = styled(ImageCardBlurSection).attrs({
  type: 'footer',
})({
  top: 0,
  paddingTop: 17,
  paddingBottom: 23,
  paddingLeft: 20,
  paddingRight: 20,
  justifyContent: 'flex-end',
});

const AnimatedBlurSectionContainer = styled(Animated.View)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
});

const DescriptionContainer = Animated.createAnimatedComponent(
  styled.View({
    overflow: 'hidden',
    zIndex: -20,
  }),
);

const Description = Animated.createAnimatedComponent(
  styled(Label).attrs({
    type: 'body',
    appearance: 'secondary',
  })({
    marginTop: 39,
    fontSize: 18,
    lineHeight: 25,
    paddingLeft: 20,
    paddingRight: 20,
    flexShrink: 1,
  }),
);

const BfitValueContainer = Animated.createAnimatedComponent(
  styled.View({
    paddingRight: 30,
    paddingLeft: 30,
    paddingTop: 12,
    paddingBottom: 12,
    right: 19,
    borderRadius: 20,
    position: 'absolute',
  }),
);

const BfitValueText = Animated.createAnimatedComponent(
  styled(Label)({
    letterSpacing: 1,
    fontSize: 14,
    lineHeight: 16,
    textTransform: 'uppercase',
  }),
);

export const Header = ({
  imageSource,
  description,
  scrollAnimatedValue,
  bfitValue,
  title,
  resetDate,
  repeat,
  memberCount,
  onHeightMeasure,
  membership,
  leagueId,
}: HeaderProps): JSX.Element => {
  const navigation = useNavigation();
  const initialDescriptionHeightRef = useRef(-1);

  const insets = useSafeAreaInsets();

  const isMember = membership !== 'none';

  const {mutateAsync: joinLeague, isLoading: isJoining} = useJoinLeague();
  const {mutateAsync: leaveLeague, isLoading: isLeaving} = useLeaveLeague();

  // TODO: add three dots to the header and attach these actions
  const handleOnInvitePressed = () => {
    navigation.navigate('LeagueInviteFriends', {leagueId});
  };

  const handleOnJoinPressed = () => {
    joinLeague(leagueId);
  };

  const handleOnLeavePressed = () => {
    leaveLeague(leagueId);
  };

  const handleButtonAction = () => {
    if (!isMember) {
      handleOnLeavePressed();
    }
  };

  const onAnimatedContainerLayout = (e: LayoutChangeEvent) => {
    if (scrollAnimatedValue.value === 0 && onHeightMeasure) {
      onHeightMeasure(e.nativeEvent.layout.height);
    }
  };

  const measureInitialDescriptionHeight = (event: LayoutChangeEvent) => {
    if (initialDescriptionHeightRef.current === -1) {
      initialDescriptionHeightRef.current = event.nativeEvent.layout.height;
    }
  };

  const actionButtonText = isMember
    ? `CLAIM ${bfitValue} $BFIT`
    : 'JOIN LEAGUE';

  const {
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  } = useHeaderAnimatedStyles(scrollAnimatedValue, initialDescriptionHeightRef);

  return (
    <Animated.View
      onLayout={onAnimatedContainerLayout}
      style={styles.container}>
      <Navbar
        iconColor="white"
        title="LEAGUE"
        titleStyle={{fontSize: 18}}
        containerStyle={{
          paddingTop: insets.top,
          height: 24,
        }}
      />
      <ImageContainer style={imageBackgroundStyle}>
        <BackgroundImage source={imageSource} />
        <AnimatedBlurSectionContainer style={blurSectionStyle}>
          <BlurSection>
            <MemberCounts>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </MemberCounts>
            <Title>{title}</Title>
            <LeaderboardCountback
              color={theme.colors.text}
              date={resetDate}
              {...{repeat}}
            />
          </BlurSection>
        </AnimatedBlurSectionContainer>
        {bfitValue !== undefined && (
          <BfitValueContainer style={bfitValueContainerStyle}>
            <BfitValueText style={bfitValueTextStyle}>
              {bfitValue} $BFIT
            </BfitValueText>
          </BfitValueContainer>
        )}
      </ImageContainer>
      <DescriptionContainer
        style={descriptionStyle}
        onLayout={measureInitialDescriptionHeight}>
        <Description>{description}</Description>
      </DescriptionContainer>
      <View style={styles.subheader}>
        <Label style={styles.subheaderLabel}>LEADERBOARD</Label>
        <FitButton
          onPress={handleButtonAction}
          text={actionButtonText}
          variant="primary-outlined"
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 400,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
  },
  subheader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 18,
    paddingLeft: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  subheaderLabel: {
    fontSize: 19,
  },
});
