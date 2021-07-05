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
  onPress?: () => void;
}

export const LeagueCard = (props: LeagueCardInterface) => {
  const {name, sport, imageUrl, privateLeague, position, memberCount, onPress} =
    props;

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
            {/* 
            <Col>
              {companyImageSource && (
                <Avatar source={companyImageSource} size={28} />
              )}
            </Col> */}
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

            <LeagueStats {...{position, memberCount}} />
          </Row>
        </ContentContainer>
      </Wrapper>
    </TouchWrapper>
  );
};
