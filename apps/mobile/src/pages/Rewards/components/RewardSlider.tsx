import {Label, TouchHandler} from '@components';
import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  FlatListProps,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {RewardCard} from '.';
import {useNavigation} from '@react-navigation/native';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const Wrapper = styled.View({
  marginTop: 40,
  paddingHorizontal: 10,
});

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Title = styled(Label).attrs({
  type: 'subheading',
})({
  fontSize: 14,
  marginBottom: 15,
  textTransform: 'uppercase',
  letterSpacing: 2,
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'subheading',
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: 'capitalize',
  color: '#ACACAC',
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
  horizontal,
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
        style={StyleSheet.compose<ViewStyle>(styles.card, {
          width: horizontal ? SCREEN_WIDTH * 0.87 : '100%',
        })}
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

  if (!rest.data?.length) {
    return null;
  }

  return (
    <Wrapper>
      <HeaderContainer>
        <Title>{title}</Title>
        <TouchHandler
          onPress={() => {
            navigation.navigate('Rewards');
          }}>
          <SeeAllText>see all</SeeAllText>
        </TouchHandler>
      </HeaderContainer>
      {isLoading && !isLoadingNextPage ? (
        <LoadingContainer>
          <ActivityIndicator color={colors.accent} />
        </LoadingContainer>
      ) : (
        <FlatList
          {...rest}
          horizontal={horizontal}
          renderItem={renderItem}
          onEndReachedThreshold={0.2}
          onEndReached={fetchNextPage}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={ListFooterComponent}
        />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    marginRight: 10,
    marginVertical: 10,
  },
});
