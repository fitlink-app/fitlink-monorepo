import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon, Label, TouchHandler} from '../common';

const FeedHeaderWrapper = styled.View(({theme: {colors}}) => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingBottom: 10,
  marginTop: 10,
  borderBottomWidth: 1,
  borderColor: colors.separator,
}));

const FilterIconContainer = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

export const FeedFilter = () => {
  const {colors} = useTheme();

  const handleFilterPressed = () => {};

  return (
    <FeedHeaderWrapper>
      <Label type={'subheading'} appearance={'primary'}>
        Recent Activities
      </Label>

      <TouchHandler onPress={handleFilterPressed}>
        <FilterIconContainer>
          <Label type={'caption'} appearance={'secondary'}>
            Filter
          </Label>
          <Icon
            name={'filter'}
            color={colors.accentSecondary}
            size={16}
            style={{marginLeft: 8}}
          />
        </FilterIconContainer>
      </TouchHandler>
    </FeedHeaderWrapper>
  );
};
