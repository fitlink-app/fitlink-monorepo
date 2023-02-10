import React from 'react';
import {ImageSourcePropType, StyleProp, Text, ViewStyle} from 'react-native';
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

const TopLabel = styled(ImageCardLabel)({
  marginTop: 28,
  marginLeft: 28,
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
  bfitValue,
  onPress,
  style,
  isVertical = false,
}: LeagueCardInterface) => {
  const Label = () => {
    if (bfitValue !== undefined) {
      return <TopLabel text={`${bfitValue} BFIT`} />;
    }
    if (position !== undefined) {
      return (
        <TopLabel
          text={`${NumberFormatterUtils.getNumberWithOrdinal(position)} place`}
        />
      );
    }
    return null;
  };

  const ImageContainer =
    bfitValue === undefined || isVertical ? Container : C2EContainer;

  return (
    <ImageContainer onPress={onPress} imageSource={imageSource} style={style}>
      <Label />
      <CardFooter>
        <LeagueCardMembers membersCount={memberCount} />
        <Title>{name}</Title>
      </CardFooter>
    </ImageContainer>
  );
};
