import React from 'react';
import styled from 'styled-components/native';
import {FlatList, StyleProp, View, ViewStyle} from 'react-native';

import {Label} from '@components';
import {
  League,
  LeagueWithDailyBfit,
} from '@fitlink/api/src/modules/leagues/entities/league.entity';
import {widthLize} from '@utils';

import {LeagueCard} from '../LeagueCard';

type CteLeagueSliderProps = {
  onCardPress: (id: string, league: League) => void;
  leagues?: LeagueWithDailyBfit[];
  style?: StyleProp<ViewStyle>;
  onEndReached: () => void;
};

export const C2ELeaguesSlider = ({
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
      <FlatList
        onEndReached={onEndReached}
        data={leagues}
        renderItem={({item}) => (
          <StyledCteLeagueCard
            isVertical
            key={item.id}
            memberCount={item.participants_total}
            name={item.name}
            sportName={item.sport.name}
            imageSource={{uri: item.image.url_640x360}}
            onPress={() => {
              onCardPress(item.id, item);
            }}
            bfitValue={item.daily_bfit ?? 0}
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

const StyledCteLeagueCard = styled(LeagueCard)({
  marginTop: 23,
  marginRight: 14,
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
