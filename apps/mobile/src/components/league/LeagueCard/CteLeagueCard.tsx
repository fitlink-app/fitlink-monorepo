import {
  ImageCard,
  ImageCardBlurSection,
  ImageCardLabel,
} from 'components/common/ImageCard';
import React from 'react';
import {StyleProp, Text, ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import {LeagueCardMembers} from './components/LeagueCardMembers';

const Container = styled(ImageCard)({
  width: 327,
  height: 350,
});

const TopLabel = styled(ImageCardLabel)({
  marginTop: 24,
  marginLeft: 24,
});

const CardFooter = styled(ImageCardBlurSection).attrs({
  type: 'footer',
})({
  paddingTop: 20,
  paddingLeft: 24,
  paddingBottom: 22,
  paddingRight: 24,
});

const Title = styled(Text)({
  color: '#FFFFFF',
  fontFamily: 'Roboto',
  fontSize: 18,
  marginTop: 6,
});

export interface LeagueCardInterface {
  name: string;
  imageUrl: string;
  memberCount: number;
  bfitValue?: number;
  position?: number;
  privateLeague?: boolean;
  invitedBy?: {image: string; name: string};
  organisation?: {name: string; image: string};
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const CteLeagueCard = ({
  name,
  imageUrl,
  memberCount,
  bfitValue,
  onPress,
  style,
}: LeagueCardInterface) => (
  <Container onPress={onPress} imageSource={{url: imageUrl}} style={style}>
    {!!bfitValue && <TopLabel text={`${bfitValue} $BFIT`} />}
    <CardFooter>
      <LeagueCardMembers membersCount={memberCount} />
      <Title>{name}</Title>
    </CardFooter>
  </Container>
);
