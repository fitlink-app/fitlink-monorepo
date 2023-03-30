import React, {FC} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/core';

import {useCteLeagues} from '@hooks';
import {CteLeagueSkeleton} from '@components';

import {getResultsFromPages} from 'utils/api';
import {C2ELeaguesSlider} from './C2ELeaguesSlider';

interface CompeteLeaguesProps {
  containerStyle?: StyleProp<ViewStyle>;
  isParticipating?: boolean;
}

export const C2ELeagues: FC<CompeteLeaguesProps> = ({
  containerStyle,
  isParticipating = false,
}) => {
  const navigation = useNavigation();

  let {data, fetchNextPage, isLoading} = useCteLeagues({
    isParticipating,
  });
  const myC2ELeagues = getResultsFromPages(data);

  if (isLoading) {
    return (
      <View style={containerStyle}>
        <CteLeagueSkeleton />
      </View>
    );
  }
  return (
    <View style={containerStyle}>
      <C2ELeaguesSlider
        leagues={myC2ELeagues}
        onCardPress={(id, league) =>
          navigation.navigate('League', {id, league})
        }
        onEndReached={fetchNextPage}
      />
    </View>
  );
};
