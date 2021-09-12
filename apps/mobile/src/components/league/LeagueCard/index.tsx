import React from 'react';
import {ImageSourcePropType, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {Avatar, Icon, Label, TouchHandler} from '../../common';
import {LeagueStats} from './components/LeagueCardStats';

const TouchWrapper = styled(TouchHandler)({
  marginBottom: 10,
});

const ContentContainer = styled.View({
  padding: 10,
  flex: 1,
  justifyContent: 'space-between',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Col = styled.View({});

const Wrapper = styled.View({
  height: 140,
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
        <BackgroundImage source={{uri: imageUrl}} />
        <ImageOverlay />

        <ContentContainer>
          <Row>
            <Col>
              {privateLeague && (
                <PrivateLabel>
                  <Icon name={'lock'} size={10} color={'white'} />
                  <Label
                    appearance={'primary'}
                    type={'caption'}
                    bold
                    style={{marginLeft: 5}}>
                    Private
                  </Label>
                </PrivateLabel>
              )}
            </Col>

            <Col>
              {organisation && (
                <Row style={{alignItems: 'center'}}>
                  <Label
                    bold
                    type={'caption'}
                    style={{marginRight: 5, maxWidth: 140}}
                    numberOfLines={1}>
                    {organisation.name}
                  </Label>
                  <Avatar url={organisation.image} size={28} />
                </Row>
              )}
            </Col>
          </Row>

          <Row
            style={{
              alignItems: 'flex-end',
            }}>
            <Col style={{flex: 1, marginRight: 30}}>
              <Label
                type={'title'}
                appearance={'primary'}
                style={{flexShrink: 1}}
                numberOfLines={3}>
                {name}
              </Label>

              <Label
                appearance={'primary'}
                type={'body'}
                style={{flexShrink: 1}}
                numberOfLines={3}>
                {sport}
              </Label>
            </Col>

            <Col>
              {!!invitedBy && (
                <Row style={{marginBottom: 5}}>
                  <Avatar url={invitedBy.image} size={28} />

                  <Col style={{marginLeft: 5}}>
                    <Label appearance={'primary'} type={'caption'}>
                      invited by
                    </Label>
                    <Label appearance={'accent'} type={'caption'}>
                      {invitedBy.name}
                    </Label>
                  </Col>
                </Row>
              )}

              <LeagueStats {...{position, memberCount}} />
            </Col>
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchWrapper>
  );
};