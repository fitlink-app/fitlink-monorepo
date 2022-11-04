import React from 'react';
import {ImageSourcePropType, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {Avatar, Icon, Label, TouchHandler} from '../../common';
import {LeagueStats} from './components/LeagueCardStats';
import {NumberFormatterUtils} from '@utils';

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 10,
});

const Wrapper = styled.View({
  height: 295,
  borderRadius: 15,
  overflow: 'hidden',
});

const BackgroundImage = styled.Image({
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
  ...StyleSheet.absoluteFillObject,
});

const PositionStats = styled.View({
  marginTop: 28,
  marginLeft: 28,
  paddingLeft: 12,
  paddingRight: 12,
  paddingTop: 8,
  paddingBottom: 8,
  borderRadius: 20,
  backgroundColor: '#060606',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const PositionLabel = styled(Label).attrs(() => ({
  type: 'body',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
  textAlign: 'center',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Line = styled.View({
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  opacity: 0.2,
  marginTop: 134,
});

const CardContent = styled.View({
  width: '100%',
  paddingTop: 26,
  paddingLeft: 28,
  paddingBottom: 29,
  backgroundColor: 'rgba(255,255,255,0.2)',
});

const MembersLabel = styled(Label).attrs(() => ({
  type: 'body',
  appearance: 'accent',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
});

const Title = styled(Label).attrs(() => ({
  type: 'title',
}))({
  fontFamily: 'Roboto',
  fontSize: 18,
  marginTop: 6,
});

const Col = styled.View({});

const PrivateLabel = styled.View(({theme}) => ({
  paddingVertical: 4,
  paddingHorizontal: 8,
  backgroundColor: theme.colors.background,
  borderRadius: 999,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}));

export interface LeagueCardInterface {
  name: string;
  sport: string;
  imageUrl: string;
  memberCount: number;
  position?: number;
  privateLeague?: boolean;
  invitedBy?: {image: string; name: string};
  organisation?: {name: string; image: string};
  onPress?: () => void;
}

export const LeagueCard = (props: LeagueCardInterface) => {
  const {
    name,
    sport,
    imageUrl,
    privateLeague,
    position,
    memberCount,
    invitedBy,
    organisation,
    onPress,
  } = props;

  return (
    <TouchWrapper {...{onPress}}>
      <Wrapper>
        <BackgroundImage
          source={require('../../../../assets/images/leagues/nature-zen.png')}
        />

        <Row>
          {position && (
            <PositionStats>
              <PositionLabel>
                {NumberFormatterUtils.getNumberWithOrdinal(position)} place
              </PositionLabel>
            </PositionStats>
          )}
        </Row>
        <Line style={{marginTop: position ? 134 : 194}} />
        <CardContent>
          <MembersLabel>
            {memberCount | 0} <Label>Members</Label>
          </MembersLabel>
          <Title>{name}</Title>
        </CardContent>
      </Wrapper>
    </TouchWrapper>
  );
};
