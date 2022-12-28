import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label, TouchHandler} from '@components';
import {BlurView} from '@react-native-community/blur';
import * as Progress from 'react-native-progress';

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 10,
});

const ContentContainer = styled.View({
  flex: 1,
  justifyContent: 'space-between',
});

const Wrapper = styled.View({
  height: 175,
  borderRadius: 20,
  overflow: 'hidden',
});

const BackgroundImage = styled.Image({
  width: '100%',
  height: 175,
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
  fontFamily: 'Roboto-Medium',
  lineHeight: 16,
});

const Line = styled.View({
  width: '100%',
  height: 1,
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
  marginLeft: 10,
});

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
    colors: {accent},
  } = useTheme();
  const {
    brand,
    currentPoints,
    title,
    expiryDate,
    requiredPoints,
    onPress,
    style,
  } = props;

  const isExpired = new Date() > expiryDate;
  const restDays = !isExpired
    ? Math.ceil(
        Math.abs(new Date(expiryDate).getTime() - new Date().getTime()) /
          (1000 * 3600 * 24),
      )
    : 0;
  const progress = Math.trunc(currentPoints / requiredPoints);
  // TODO: ask Paul
  // const isLocked = progress < 1 && !isClaimed;

  return (
    <TouchWrapper onPress={onPress} style={style}>
      <Wrapper style={{opacity: isExpired ? 0.5 : 1}}>
        <BackgroundImage
          source={require('../../../../assets/images/rewards-1.png')}
        />
        <ContentContainer>
          <BlurView
            blurRadius={3}
            downsampleFactor={20}
            style={styles.blur}
            overlayColor="transparent"
          />
          <Row style={styles.topRow}>
            <Points style={styles.topRowLeftItem}>
              {requiredPoints} <Label style={styles.medium}>$BFIT</Label>
            </Points>
            <Progress.Bar
              width={98}
              color={accent}
              borderWidth={0}
              progress={progress}
              style={styles.topRowRightItem}
              unfilledColor={'rgba(255, 255, 255, 0.4)'}
            />
          </Row>
          <Line />
          <Row style={styles.bottomRow}>
            <View style={styles.flexed}>
              <Label style={styles.title} type="title" numberOfLines={1}>
                {brand}
              </Label>
              <Label numberOfLines={1}>{title}</Label>
            </View>
            <ExpiryDate>
              {isExpired ? 'Expired' : `${restDays} Days Left`}
            </ExpiryDate>
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchWrapper>
  );
};

const styles = StyleSheet.create({
  blur: {
    position: 'absolute',
    width: '100%',
    height: 53,
    elevation: 1,
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 53,
    paddingHorizontal: 24,
  },
  bottomRow: {
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  topRowLeftItem: {
    position: 'absolute',
    left: 24,
    elevation: 2,
  },
  topRowRightItem: {
    position: 'absolute',
    right: 24,
    elevation: 2,
  },
  title: {
    marginBottom: 6,
    fontFamily: 'Roboto-Medium', // TODO: rework font styling system
  },
  flexed: {
    flex: 1,
  },
  medium: {
    fontFamily: 'Roboto-Medium',
  },
});
