import React from 'react';
import {
  FlatList,
  FlatListProps,
  StyleProp,
  ViewStyle,
  View,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import styled from 'styled-components/native';

import {
  Label,
  TouchHandler,
  BfitSpinner,
  HorizontalSliderSkeleton,
} from '@components';
import {RewardPublic} from '@fitlink/api/src/modules/rewards/entities/reward.entity';
import {getViewBfitValue, heightLize, widthLize} from '@utils';

import {RewardCard} from '.';
import {FEED_CAROUSEL_CARD_WIDTH} from '../../Feed/constants';

interface RewardSliderProps
  extends Omit<
    FlatListProps<RewardPublic>,
    | 'horizontal'
    | 'renderItem'
    | 'showsHorizontalScrollIndicator'
    | 'contentContainerStyle'
    | 'ListFooterComponent'
  > {
  userBfit: number;
  title: string;
  userPoints: number;
  isLoading?: boolean;
  isLoadingNextPage?: boolean;
  LockedShow?: boolean;
  fetchNextPage: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  showSeeAll?: boolean;
}

export const RewardSlider = ({
  title,
  userPoints,
  userBfit,
  isLoading,
  fetchNextPage,
  LockedShow,
  isLoadingNextPage,
  containerStyle,
  showSeeAll = false,
  ...rest
}: RewardSliderProps) => {
  const navigation = useNavigation();

  const renderItem = ({item}: {item: RewardPublic}) => {
    return (
      <RewardCard
        style={
          LockedShow
            ? {
                marginLeft: widthLize(20),
                marginVertical: heightLize(11),
              }
            : {
                width: FEED_CAROUSEL_CARD_WIDTH,
                marginVertical: 10,
                marginLeft: widthLize(20),
              }
        }
        brand={item.brand}
        title={item.name_short}
        image={item.image.url_640x360}
        expiryDate={new Date(item.reward_expires_at)}
        currentValue={item.bfit_required ? userBfit : userPoints}
        requiredValue={
          item.bfit_required
            ? getViewBfitValue(item.bfit_required)
            : item.points_required
        }
        onPress={() =>
          navigation.navigate('Reward', {
            id: item.id,
            image: item.image.url_512x512,
          })
        }
        isClaimed={item.redeemed}
        organisation={
          item.organisation && {
            name: item.organisation.name,
            image: item.organisation.avatar?.url_128x128,
          }
        }
        code={item.code}
        label={item.bfit_required ? 'BFIT' : 'Points'}
      />
    );
  };

  const ListFooterComponent = isLoadingNextPage ? (
    <BfitSpinner wrapperStyle={styles.newItemLoadingContainer} />
  ) : null;

  if (isLoading && !isLoadingNextPage) {
    return (
      <View style={containerStyle}>
        <HorizontalSliderSkeleton />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <HeaderContainer>
        <Title>{title}</Title>
        {showSeeAll && (
          <TouchHandler
            onPress={() => {
              navigation.navigate('Rewards');
            }}
          >
            <SeeAllText>see all</SeeAllText>
          </TouchHandler>
        )}
      </HeaderContainer>
      <FlatList
        {...{...rest, renderItem, ListFooterComponent}}
        showsHorizontalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        onEndReached={fetchNextPage}
        horizontal={!LockedShow}
        contentContainerStyle={{paddingRight: 20}}
      />
    </View>
  );
};

const HeaderContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginHorizontal: widthLize(20),
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

const styles = StyleSheet.create({
  newItemLoadingContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    height: 170,
  },
  loadingContainer: {
    height: 170,
    justifyContent: 'center',
  },
});
