import React, {FC} from 'react';
import {useNavigation} from '@react-navigation/core';

import {useMyLeagues} from '@hooks';

import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import {getResultsFromPages} from 'utils/api';
import {StyleProp, View, ViewStyle} from 'react-native';

interface CompeteLeaguesProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const CompeteLeagues: FC<CompeteLeaguesProps> = ({containerStyle}) => {
  const navigation = useNavigation();

  // TODO: temporary solution, the API should accept additional params for my c2e leagues
  // const {data, fetchNextPage} = useCteLeagues();

  const {data, fetchNextPage} = useMyLeagues();

  const results = getResultsFromPages(data);
  // TODO: temporary solution
  const myC2ELeagues = results.filter(res => res.bfit !== undefined);

  if (!myC2ELeagues.length) {
    return null;
  }

  return (
    <View style={containerStyle}>
      <CteLeagueSlider
        leagues={myC2ELeagues}
        onCardPress={(id, league) =>
          navigation.navigate('League', {id, league})
        }
        onEndReached={fetchNextPage}
      />
    </View>
  );
};
