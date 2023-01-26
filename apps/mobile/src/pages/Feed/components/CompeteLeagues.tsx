import React, {FC} from 'react';
import {useNavigation} from '@react-navigation/core';

import {useCteLeagues} from '@hooks';

import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import {getResultsFromPages} from 'utils/api';
import {StyleProp, View, ViewStyle} from 'react-native';

interface CompeteLeaguesProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const CompeteLeagues: FC<CompeteLeaguesProps> = ({containerStyle}) => {
  const navigation = useNavigation();

  const {data, fetchNextPage} = useCteLeagues();

  const results = getResultsFromPages(data);

  if (!results.length) {
    return null;
  }

  return (
    <View style={containerStyle}>
      <CteLeagueSlider
        leagues={results}
        onCardPress={(id, league) =>
          navigation.navigate('League', {id, league})
        }
        onEndReached={fetchNextPage}
      />
    </View>
  );
};
