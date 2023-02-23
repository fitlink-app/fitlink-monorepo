import React from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import styled from 'styled-components/native';

import {NumberFormatterUtils} from '@utils';

import {
  ImageCard,
  ImageCardBlurSection,
  ImageCardLabel,
} from 'components/common/ImageCard';
import {LeagueCardMembers} from './components';

const C2EContainer = styled(ImageCard)({
  width: 327,
  height: 350,
});

const Container = styled(ImageCard)({
  marginBottom: 30,
  height: 295,
});

const CardFooter = styled(ImageCardBlurSection).attrs({
  type: 'footer',
})({
  paddingTop: 26,
  paddingLeft: 28,
  paddingBottom: 29,
});

const Title = styled(Text)({
  color: '#FFFFFF',
  fontFamily: 'Roboto',
  fontSize: 18,
  fontWeight: 500,
  marginTop: 6,
});

export interface LeagueCardInterface {
  name: string;
  imageSource: ImageSourcePropType;
  memberCount: number;
  sportName: string;
  position?: number;
  bfitValue?: number;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  isVertical?: boolean;
}

export const LeagueCard = ({
  name,
  imageSource,
  position,
  memberCount,
  sportName,
  bfitValue,
  onPress,
  style,
  isVertical = false,
}: LeagueCardInterface) => {
  const check = bfitValue === undefined || isVertical;
  const Label = () => {
    if (bfitValue !== undefined) {
      return (
        <ImageCardLabel
          labelStyle={[
            styles.bfitLabel,
            check ? {marginTop: 148} : {marginTop: 203},
          ]}
          textStyle={styles.bfitText}
          text={`${bfitValue} BFIT`}
        />
      );
    }
    if (position !== undefined) {
      return (
        <ImageCardLabel
          labelStyle={styles.bfitLabel}
          textStyle={styles.bfitText}
          text={`${NumberFormatterUtils.getNumberWithOrdinal(position)} place`}
        />
      );
    }
    return null;
  };

  const ImageContainer = check ? Container : C2EContainer;

  return (
    <ImageContainer onPress={onPress} imageSource={imageSource} style={style}>
      <ImageCardLabel labelStyle={styles.sportNameLabel} text={sportName} />
      <CardFooter>
        <LeagueCardMembers membersCount={memberCount} />
        <Title>{name}</Title>
      </CardFooter>
      <Label />
    </ImageContainer>
  );
};

const styles = StyleSheet.create({
  sportNameLabel: {
    position: 'absolute',
    alignSelf: 'flex-start',
    top: 28,
    left: 28,
    backgroundColor: '#000000',
    opacity: 0.8,
  },
  bfitLabel: {
    top: 28,
    position: 'absolute',
    right: 28,
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
  },
  bfitText: {
    color: '#000000',
  },
});
