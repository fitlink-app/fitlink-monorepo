import React, {FC} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/core';

import {useCteLeagues} from '@hooks';

import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import {getResultsFromPages} from 'utils/api';

interface CompeteLeaguesProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export const CompeteLeagues: FC<CompeteLeaguesProps> = ({containerStyle}) => {
  const navigation = useNavigation();

  const {data, fetchNextPage} = useCteLeagues({isParticipating: true});
  const myC2ELeagues = getResultsFromPages(data);

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
