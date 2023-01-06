import {NumberFormatterUtils} from '@utils';
import {
  ImageCard,
  ImageCardBlurSection,
  ImageCardLabel,
} from 'components/common/ImageCard';
import React from 'react';
import {ImageSourcePropType, StyleProp, Text, ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import {LeagueCardMembers} from './components/LeagueCardMembers';

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
  marginTop: 6,
});

export interface LeagueCardInterface {
  name: string;
  sport: string;
  imageSource: ImageSourcePropType;
  memberCount: number;
  position?: number;
  privateLeague?: boolean;
  invitedBy?: {image: string; name: string};
  organisation?: {name: string; image: string};
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const LeagueCard = ({
  name,
  imageSource,
  position,
  memberCount,
  onPress,
  style,
}: LeagueCardInterface) => (
  <Container onPress={onPress} imageSource={imageSource} style={style}>
    {position && (
      <TopLabel
        text={`${NumberFormatterUtils.getNumberWithOrdinal(position)} place`}
      />
    )}
    <CardFooter>
      <LeagueCardMembers membersCount={memberCount} />
      <Title>{name}</Title>
    </CardFooter>
  </Container>
);
