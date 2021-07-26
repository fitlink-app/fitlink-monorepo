import React, {useEffect} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';
import {StackScreenProps} from '@react-navigation/stack';
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  RefreshControl,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, Navbar, NAVBAR_HEIGHT} from '@components';
import {InviteRow} from './components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useLeagueInvitables} from '@hooks';
import {getResultsFromPages} from 'utils/api';

const Wrapper = styled.View({flex: 1});

const EmptyContainer = styled.View({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
});

export const LeagueInviteFriends = (
  props: StackScreenProps<RootStackParamList, 'LeagueInviteFriends'>,
) => {
  const {leagueId} = props.route.params;

  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    error,
    isStale,
  } = useLeagueInvitables(leagueId);

  const results = getResultsFromPages(data);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // Fetch invitable users
    });
  }, []);

  async function handleInvitePressed(id: string) {
    // Set user as loading user
    // Handle invite
  }

  const handleOnRefresh = () => {
    refetch();
  };

  const renderItem = ({item}: {item: UserPublic}) => {
    return (
      <InviteRow
        userId={item.id as string}
        name={item.name as string}
        isInvited={false}
        onInvitePressed={handleInvitePressed}
        avatarSource={item.avatar?.url_128x128}
        isLoading={false}
      />
    );
  };

  const keyExtractor = (item: UserPublic, index: number) =>
    item.id + index.toString();

  const ListEmptyComponent = (
    <Label style={{textAlign: 'center'}}>You don't follow anyone yet.</Label>
  );

  const paddingTop = NAVBAR_HEIGHT + insets.top;

  return (
    <Wrapper>
      <Navbar backButtonIcon={'times'} title="Invite Friends" overlay />
      {isFetchedAfterMount ? (
        <FlatList
          {...{keyExtractor, renderItem, ListEmptyComponent}}
          data={results}
          contentContainerStyle={{paddingBottom: 20, flexGrow: 1}}
          contentInset={{top: paddingTop, left: 0, bottom: 0, right: 0}}
          contentOffset={{x: 0, y: -paddingTop}}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior={'never'}
          refreshControl={
            <RefreshControl
              tintColor={colors.accent}
              refreshing={isFetching && isFetchedAfterMount}
              onRefresh={handleOnRefresh}
            />
          }
        />
      ) : (
        <EmptyContainer>
          <ActivityIndicator color={colors.accent} />
        </EmptyContainer>
      )}
    </Wrapper>
  );
};
