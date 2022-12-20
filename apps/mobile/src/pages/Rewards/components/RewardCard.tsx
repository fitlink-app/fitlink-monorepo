import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';
import {Label, TouchHandler} from '@components';
import {BlurView} from '@react-native-community/blur';

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 10,
});

const ContentContainer = styled.View({
  flex: 1,
  justifyContent: 'space-between',
});

const Wrapper = styled.View({
  height: 211,
  borderRadius: 20,
  overflow: 'hidden',
});

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000004D', '#00000099'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const BackgroundImage = styled.Image({
  width: '100%',
  height: 211,
  resizeMode: 'cover',
  ...StyleSheet.absoluteFillObject,
});

const Row = styled.View({
  flexDirection: 'row',
  paddingHorizontal: 24,
});

const Points = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
}))({
  position: 'relative',
  fontSize: 14,
  lineHeight: 16,
});

const HeaderLine = styled.View({
  width: 98,
  height: 8,
  marginTop: 2,
  backgroundColor: '#00E9D7',
  borderRadius: 100,
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  border: 0,
  opacity: 0.2,
});

const ExpiryDate = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'primary',
}))({
  fontSize: 14,
  textTransform: 'uppercase',
});

const AddBtn = styled.View({
  width: 44,
  height: 44,
  backgroundColor: '#060606',
  borderRadius: 22,
  marginTop: -12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const AddIcon = styled.Text(({theme: {colors}}) => ({
  textAlign: 'center',
  fontSize: 28,
  marginTop: -3,
  color: colors.text,
}));

// const CodeBox = styled.View(({theme: {colors}}) => ({
//   paddingVertical: 5,
//   paddingHorizontal: 10,
//   backgroundColor: colors.surface,
//   borderRadius: 9999,
// }));

export interface RewardOrganisation {
  name: string;
  image?: string;
}

interface RewardCardProps extends ViewProps {
  brand: string;
  title: string;
  image: string;
  expiryDate: Date;
  currentPoints: number;
  requiredPoints: number;
  onPress: () => void;
  organisation: RewardOrganisation;
  isClaimed?: boolean;
  code?: string;
}

export const RewardCard = (props: RewardCardProps) => {
  const {
    title,
    image,
    expiryDate,
    currentPoints,
    requiredPoints,
    onPress,
    isClaimed = false,
    style,
  } = props;

  const isExpired = new Date() > expiryDate;
  const restDays = !isExpired
    ? Math.ceil(
        Math.abs(new Date(expiryDate).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      )
    : 0;
  const progress = Math.min(Math.max(currentPoints / requiredPoints, 0), 1);
  const isLocked = progress < 1 && !isClaimed;

  return (
    <TouchWrapper {...{onPress, style}}>
      <Wrapper style={{opacity: isExpired ? 0.5 : 1}}>
        <BackgroundImage source={{uri: image}} />
        <ImageOverlay />

        <ContentContainer>
          <BlurView
            style={{
              position: 'absolute',
              width: '100%',
              height: 64,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
            blurType="dark"
            blurRadius={1}
            blurAmount={1}
            overlayColor={'transparent'}
          />
          <Row
            style={{
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 64,
              paddingHorizontal: 24,
            }}>
            <Points>
              {requiredPoints} <Label>$BFIT</Label>
            </Points>
            {/* <HeaderLine /> */}
            <View
              style={{
                height: 8,
                width: 100,
                backgroundColor: '#ACACAC',
                borderRadius: 100,
                  overflow: 'hidden',
              }}>
              <View
                style={{
                  width: `${(currentPoints / requiredPoints) * 100}%`,
                  height: 8,
                  backgroundColor: '#00E9D7',
                }}
              />
            </View>
          </Row>
          <Line />
          <Row
            style={{
              justifyContent: 'space-between',
              flex: 1,
              alignItems: 'flex-end',
              paddingBottom: 20,
            }}>
            <View style={{flex: 2}}>
              <ExpiryDate>
                {isExpired ? 'Expired' : `${restDays} Days Left`}
              </ExpiryDate>
              <Label
                type={'title'}
                appearance={'primary'}
                numberOfLines={1}
                style={{textTransform: 'capitalize'}}>
                {title}
              </Label>
            </View>
            {isLocked ? (
              <AddBtn>
                <AddIcon>+</AddIcon>
              </AddBtn>
            ) : null}
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchWrapper>
  );
};
