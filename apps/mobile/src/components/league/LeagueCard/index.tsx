import React from 'react';
import {Dimensions, StyleSheet, Text} from 'react-native';
import styled from 'styled-components/native';
import {Label, TouchHandler} from '../../common';
import {NumberFormatterUtils} from '@utils';
import {BlurView} from '@react-native-community/blur';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 30,
});

const Wrapper = styled.View({
  height: 295,
  borderRadius: 20,
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

const MembersLabel = styled(Text)({
  color: '#00E9D7',
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  textTransform: 'uppercase',
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
  imageUrl: string;
  memberCount: number;
  position?: number;
  privateLeague?: boolean;
  invitedBy?: {image: string; name: string};
  organisation?: {name: string; image: string};
  onPress?: () => void;
}

export const LeagueCard = (props: LeagueCardInterface) => {
  const {name, imageUrl, position, memberCount, onPress} = props;

  return (
    <TouchWrapper {...{onPress}}>
      <Wrapper>
        <BackgroundImage source={{uri: imageUrl}} />
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
          <BlurView
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: 100,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.2)',
            }}
            blurType={'dark'}
            blurRadius={1}
            blurAmount={1}
            overlayColor={'transparent'}
          />
          <MembersLabel>
            {memberCount | 0} <Text style={{color: '#FFFFFF'}}>Members</Text>
          </MembersLabel>
          <Title>{name}</Title>
        </CardContent>
      </Wrapper>
    </TouchWrapper>
  );
};
