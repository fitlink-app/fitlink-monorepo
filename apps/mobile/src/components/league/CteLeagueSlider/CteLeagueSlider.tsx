import {Label} from '@components';
import {League} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {widthLize} from '@utils';
import React from 'react';
import {FlatList, StyleProp, View, ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import {CteLeagueCard} from '../LeagueCard';

const StyledCteLeagueCard = styled(CteLeagueCard)({
  marginTop: 23,
  marginRight: 14,
  marginBottom: 20,
});

const LeaguesTitleContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: '20',
});

const Title = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#ffffff',
});

type CteLeagueSliderProps = {
  onCardPress: (id: string, league: League) => void;
  leagues?: League[];
  style?: StyleProp<ViewStyle>;
  onEndReached: () => void;
};

export const CteLeagueSlider = ({
  onCardPress,
  leagues,
  style,
  onEndReached,
}: CteLeagueSliderProps) => {
  if (leagues === undefined || leagues?.length === 0) {
    return null;
  }
  return (
    <View style={style}>
      <LeaguesTitleContainer>
        <Title>Compete to earn leagues</Title>
      </LeaguesTitleContainer>
      <FlatList<League>
        onEndReached={onEndReached}
        data={leagues}
        renderItem={({item}) => (
          <StyledCteLeagueCard
            key={item.id}
            memberCount={item.participants_total}
            name={item.name}
            imageUrl={item.image.url_640x360}
            onPress={() => {
              onCardPress(item.id, item);
            }}
            bfitValue={item.bfit}
          />
        )}
        horizontal
        overScrollMode={'never'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          justifyContent: 'space-between',
          paddingLeft: widthLize(20),
        }}
      />
    </View>
  );
};
