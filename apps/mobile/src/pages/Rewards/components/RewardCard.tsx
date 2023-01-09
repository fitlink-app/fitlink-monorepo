import React from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';
import {Label, TouchHandler} from '@components';
import {BlurView} from '@react-native-community/blur';
import ProgressBar from './ProgressBar';
import {calculateDaysLeft} from '@utils';

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
    brand,
    title,
    image, // TODO: fallback image
    expiryDate,
    currentPoints,
    requiredPoints,
    onPress,
    style,
  } = props;

  const isExpired = new Date() > expiryDate;
  const restDays = calculateDaysLeft(expiryDate, isExpired);
  const isLocked = currentPoints >= requiredPoints;

  return (
    <TouchWrapper {...{onPress, style}}>
      <Wrapper style={{opacity: isExpired ? 0.5 : 1}}>
        <BackgroundImage source={{uri: image}} />
        <ImageOverlay />
        <ContentContainer>
          <BlurView
            style={styles.blur}
            blurType="dark"
            blurRadius={1}
            blurAmount={1}
            overlayColor="transparent"
          />
          <Row style={styles.topRow}>
            <Points>
              {requiredPoints} <Label>$BFIT</Label>
            </Points>
            <ProgressBar
              progress={currentPoints / requiredPoints}
              height={8}
              width={100}
            />
          </Row>
          <Line />
          <Row style={styles.bottomRow}>
            <View style={styles.leftCol}>
              <Label type="title" appearance="accent" numberOfLines={1}>
                {brand}
              </Label>
              <Label
                style={styles.bottomLabel}
                type="body"
                appearance="primary"
                numberOfLines={1}>
                {title}
              </Label>
            </View>
            {isLocked ? (
              <AddBtn>
                <AddIcon>+</AddIcon>
              </AddBtn>
            ) : (
              <ExpiryDate>
                {isExpired ? 'Expired' : `${restDays} Days Left`}
              </ExpiryDate>
            )}
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
    height: 64,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  topRow: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 24,
  },
  bottomRow: {
    justifyContent: 'space-between',
    flex: 1,
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  leftCol: {
    flex: 1,
    marginRight: 10,
  },
  bottomLabel: {
    marginTop: 5,
  },
});
