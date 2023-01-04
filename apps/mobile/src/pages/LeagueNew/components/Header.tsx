import {Label, Navbar} from '@components';
import {ImageCardBlurSection} from 'components/common/ImageCard';
import {LeaderboardCountback} from 'pages/League/components/LeaderboardCountback';
import React, {useCallback, useState} from 'react';
import {ImageSourcePropType, LayoutChangeEvent, StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import {useHeaderAnimatedStyles} from './useHeaderAnimatedStyles';

type HeaderProps = {
  imageSource: ImageSourcePropType;
  scrollAnimatedValue: Animated.SharedValue<number>;
  memberCount: number;
  title: string;
  resetDate: Date;
  repeat: boolean;
  bfitValue: number;
  description: string;
  onHeightMesure?: (height: number) => void;
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
  }),
);

const Description = Animated.createAnimatedComponent(
  styled(Label).attrs({
    type: 'body',
    appearance: 'secondary',
  })({
    marginTop: 14,
    color: '#ACACAC',
    fontSize: 18,
    lineHeight: 25,
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
  onHeightMesure,
}: HeaderProps): JSX.Element => {
  const onAnimatedContainerLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (scrollAnimatedValue.value === 0 && onHeightMesure) {
        onHeightMesure(e.nativeEvent.layout.height);
      }
    },
    [onHeightMesure, scrollAnimatedValue.value],
  );

  const {
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  } = useHeaderAnimatedStyles(scrollAnimatedValue);

  return (
    <Animated.View
      onLayout={onAnimatedContainerLayout}
      style={[
        {
          zIndex: 400,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1E1E1E',
        },
      ]}>
      <ImageContainer style={imageBackgroundStyle}>
        <BackgroundImage source={imageSource} />
        <AnimatedBlurSectionContainer style={blurSectionStyle}>
          <BlurSection>
            <MemberCounts>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </MemberCounts>
            <Title>{title}</Title>
            <LeaderboardCountback date={resetDate} {...{repeat}} />
          </BlurSection>
        </AnimatedBlurSectionContainer>
        <Navbar
          iconColor={'white'}
          title="LEAGUE"
          titleStyle={{fontSize: 18}}
          containerStyle={{
            paddingTop: 0,
            height: 86,
          }}
        />
        <BfitValueContainer style={bfitValueContainerStyle}>
          <BfitValueText style={bfitValueTextStyle}>
            {bfitValue} $BFIT
          </BfitValueText>
        </BfitValueContainer>
      </ImageContainer>
      <DescriptionContainer style={descriptionStyle}>
        <Description>{description}</Description>
      </DescriptionContainer>
    </Animated.View>
  );
};
