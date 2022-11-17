import React from 'react';
import styled from 'styled-components/native';
import {ActivityType} from '@fitlink/api/src/modules/activities/activities.constants';
import {FilterButton} from './components/FilterButton';

const Container = styled.View({
  flexDirection: 'row',
  paddingTop: 15,
});

interface FiltersProps {
  types: ActivityType[];
  onTypePressed: (type: ActivityType) => void;
}

export const Filters = ({types, onTypePressed}: FiltersProps) => {
  return (
    <Container>
      <FilterButton
        text={'Classes'}
        selected={types.includes(ActivityType.Class)}
        onPress={() => onTypePressed(ActivityType.Class)}
      />

      <FilterButton
        text={'Group Activities'}
        selected={types.includes(ActivityType.Group)}
        onPress={() => onTypePressed(ActivityType.Group)}
      />
      <FilterButton
        text={'Routes'}
        selected={types.includes(ActivityType.Route)}
        onPress={() => onTypePressed(ActivityType.Route)}
      />
    </Container>
  );
};
