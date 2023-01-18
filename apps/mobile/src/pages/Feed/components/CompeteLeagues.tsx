import React from 'react';
import {useNavigation} from '@react-navigation/core';
import styled from 'styled-components/native';

import {useCteLeagues} from '@hooks';

import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import {getResultsFromPages} from 'utils/api';

const Wrapper = styled.View({
  marginTop: 40,
});

export const CompeteLeagues = () => {
  const navigation = useNavigation();

  const {data, fetchNextPage} = useCteLeagues();

  const results = getResultsFromPages(data);

  if (!results.length) {
    return null;
  }

  return (
    <Wrapper>
      <CteLeagueSlider
        leagues={results}
        onCardPress={(id, league) =>
          navigation.navigate('League', {id, league})
        }
        onEndReached={fetchNextPage}
      />
    </Wrapper>
  );
};
