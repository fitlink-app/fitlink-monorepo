import {Label} from '@components';
import React from 'react';
import {FlatList, FlatListProps, Dimensions} from 'react-native';
import styled from 'styled-components/native';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {RewardCard} from '.';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');
const HORIZONTAL_PADDING = 20;

const Wrapper = styled.View({marginTop: 20});

const Title = styled(Label).attrs({
  type: 'subheading',
})({
  marginBottom: 15,
  paddingLeft: HORIZONTAL_PADDING,
});

interface RewardSliderProps
  extends Omit<
    FlatListProps<RewardPublic>,
    | 'horizontal'
    | 'renderItem'
    | 'showsHorizontalScrollIndicator'
    | 'contentContainerStyle'
  > {
  title: string;
}

export const RewardSlider = ({title, ...rest}: RewardSliderProps) => {
  const renderItem = ({item}: {item: RewardPublic}) => {
    return (
      <RewardCard
        style={{marginRight: 10, width: SCREEN_WIDTH * 0.8}}
        brand={item.brand}
        title={item.name_short}
        image={item.image.url_640x360}
        expiryDate={new Date(item.reward_expires_at)}
        currentPoints={88}
        requiredPoints={150}
        onPress={() => {}}
        isClaimed={false}
        organisation={{
          name: 'Fitlink',
          image: undefined,
        }}
        code={'FIT10'}
      />
    );
  };

  if (!rest.data?.length) return null;

  return (
    <Wrapper>
      <Title>{title}</Title>
      <FlatList
        {...{...rest, renderItem}}
        contentContainerStyle={{paddingHorizontal: HORIZONTAL_PADDING}}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    </Wrapper>
  );
};
