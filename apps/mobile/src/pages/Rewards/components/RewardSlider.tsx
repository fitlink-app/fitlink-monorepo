import {Label} from '@components';
import React from 'react';
import {
  FlatList,
  FlatListProps,
  Dimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {RewardCard} from '.';
import {useNavigation} from '@react-navigation/native';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');
const HORIZONTAL_PADDING = 20;

const Wrapper = styled.View({marginTop: 20});

const Title = styled(Label).attrs({
  type: 'subheading',
})({
  marginBottom: 15,
  paddingLeft: HORIZONTAL_PADDING,
});

const LoadingContainer = styled.View({height: 170, justifyContent: 'center'});

const NewItemLoadingContainer = styled.View({
  width: 80,
  justifyContent: 'center',
  alignItems: 'center',
  height: 170,
});

interface RewardSliderProps
  extends Omit<
    FlatListProps<RewardPublic>,
    | 'horizontal'
    | 'renderItem'
    | 'showsHorizontalScrollIndicator'
    | 'contentContainerStyle'
    | 'ListFooterComponent'
  > {
  title: string;
  userPoints: number;
  isLoading?: boolean;
  isLoadingNextPage?: boolean;
  fetchNextPage: () => void;
}

export const RewardSlider = ({
  title,
  userPoints,
  isLoading,
  fetchNextPage,
  isLoadingNextPage,
  ...rest
}: RewardSliderProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const renderItem = ({item}: {item: RewardPublic}) => {
    return (
      <RewardCard
        style={{marginRight: 10, width: SCREEN_WIDTH * 0.8}}
        brand={item.brand}
        title={item.name_short}
        image={item.image.url_640x360}
        expiryDate={new Date(item.reward_expires_at)}
        currentPoints={userPoints}
        requiredPoints={item.points_required}
        onPress={() => navigation.navigate('Reward', {id: item.id})}
        isClaimed={item.redeemed}
        organisation={
          item.organisation && {
            name: item.organisation.name,
            image: item.organisation.avatar?.url_128x128,
          }
        }
        code={item.code}
      />
    );
  };

  const ListFooterComponent = isLoadingNextPage ? (
    <NewItemLoadingContainer>
      <ActivityIndicator color={colors.accent} />
    </NewItemLoadingContainer>
  ) : null;

  if (!rest.data?.length) return null;

  return (
    <Wrapper>
      <Title>{title}</Title>
      {isLoading && !isLoadingNextPage ? (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      ) : (
        <FlatList
          {...{...rest, renderItem, ListFooterComponent}}
          contentContainerStyle={{
            paddingHorizontal: HORIZONTAL_PADDING,
          }}
          showsHorizontalScrollIndicator={false}
          onEndReachedThreshold={0.2}
          onEndReached={fetchNextPage}
          horizontal
        />
      )}
    </Wrapper>
  );
};
