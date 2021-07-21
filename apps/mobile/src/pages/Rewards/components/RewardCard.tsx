import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Chip, Label, TouchHandler} from '@components';
import {format} from 'date-fns';

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 10,
});

const ContentContainer = styled.View({
  padding: 10,
  flex: 1,
  justifyContent: 'space-between',
});

const Wrapper = styled.View({
  height: 160,
  borderRadius: 15,
  overflow: 'hidden',
});

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000004D', '#00000099'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const BackgroundImage = styled.Image({
  resizeMode: 'cover',
  ...StyleSheet.absoluteFillObject,
});

const Row = styled.View({
  flexDirection: 'row',
});

const CodeBox = styled.View(({theme: {colors}}) => ({
  paddingVertical: 5,
  paddingHorizontal: 10,
  backgroundColor: colors.surface,
  borderRadius: 9999,
}));

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
  const {colors, fonts} = useTheme();

  const {
    brand,
    title,
    image,
    expiryDate,
    currentPoints,
    requiredPoints,
    onPress,
    isClaimed = false,
    organisation,
    code,
    style,
  } = props;

  const isExpired = new Date() > expiryDate;
  const progress = Math.min(Math.max(currentPoints / requiredPoints, 0), 1);
  const isLocked = progress < 1 && !isClaimed;

  return (
    <TouchWrapper {...{onPress, style}}>
      <Wrapper style={{opacity: isExpired ? 0.5 : 1}}>
        <BackgroundImage source={{uri: image}} />
        <ImageOverlay />

        <ContentContainer>
          <Row
            style={{
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}>
            <Row style={{alignItems: 'center'}}>
              <Chip
                textStyle={{
                  fontFamily: fonts.bold,
                  color: colors.chartUnfilled,
                }}
                style={{backgroundColor: 'rgba(255,255,255,.5)'}}
                progress={progress}
                text={`${requiredPoints} points`}
                disabled={true}
              />
              {isLocked && !isExpired && (
                <Label
                  style={{marginLeft: 5, fontSize: 10}}
                  type={'caption'}
                  appearance={'primary'}
                  bold>
                  {requiredPoints - currentPoints} points remaining
                </Label>
              )}
            </Row>

            <View style={{alignItems: 'flex-end'}}>
              {/* Coupon code if exists */}
              {code && isClaimed && (
                <CodeBox style={{marginBottom: 10}}>
                  <Label type={'caption'} appearance={'primary'} bold>
                    {code}
                  </Label>
                </CodeBox>
              )}

              {organisation && <Avatar url={organisation.image} size={28} />}
            </View>
          </Row>

          <Row
            style={{
              justifyContent: 'space-between',
              flex: 1,
              alignItems: 'flex-end',
            }}>
            <View style={{paddingRight: 20, flex: 2}}>
              <Label type={'body'} appearance={'primary'} bold>
                {brand}
              </Label>
              <Label type={'title'} appearance={'primary'} numberOfLines={1}>
                {title}
              </Label>
            </View>

            <View style={{justifyContent: 'flex-end', flex: 1}}>
              <Label
                numberOfLines={2}
                type={'caption'}
                appearance={'primary'}
                style={{textAlign: 'right'}}>
                {isExpired
                  ? `Expired`
                  : `Expires at ${format(expiryDate, 'do MMMM yyyy')}`}
              </Label>
            </View>
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchWrapper>
  );
};
