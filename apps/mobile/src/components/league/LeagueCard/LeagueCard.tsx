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
import {useMeasureLayout} from '@hooks';

import {
  ImageCard,
  ImageCardBlurSection,
  ImageCardLabel,
} from 'components/common/ImageCard';
import {LeagueCardMembers} from './components';

const CARD_FOOTER_PADDING_TOP = 26;

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
  const Label = () => {
    let text: string | undefined;

    if (bfitValue !== undefined) {
      text = `${bfitValue} BFIT`;
    } else if (position !== undefined) {
      text = `${NumberFormatterUtils.getNumberWithOrdinal(position)} place`;
    }

    const {measureLayout, layout} = useMeasureLayout();

    if (text === undefined) {
      return null;
    }

    return (
      <ImageCardLabel
        onLayout={measureLayout}
        labelStyle={[
          styles.bfitLabel,
          {top: -(CARD_FOOTER_PADDING_TOP + layout.height / 2 + 1)}, // 1 - half of borderline height
        ]}
        textStyle={styles.bfitText}
        text={text}
      />
    );
  };

  const ImageContainer = isVertical ? C2EContainer : Container;

  return (
    <ImageContainer onPress={onPress} imageSource={imageSource} style={style}>
      <ImageCardLabel labelStyle={styles.sportNameLabel} text={sportName} />
      <CardFooter>
        <Label />
        <LeagueCardMembers membersCount={memberCount} />
        <Title>{name}</Title>
      </CardFooter>
    </ImageContainer>
  );
};

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
  paddingTop: CARD_FOOTER_PADDING_TOP,
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
    right: 28,
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  bfitText: {
    color: '#000000',
  },
});
