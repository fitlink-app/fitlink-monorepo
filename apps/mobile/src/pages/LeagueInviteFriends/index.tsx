import React, {useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {StackScreenProps} from '@react-navigation/stack';
import {FlatList, Platform, RefreshControl, StyleSheet} from 'react-native';

import {getErrors} from '@api';
import {Label, Navbar, NAVBAR_HEIGHT, BfitSpinner} from '@components';
import {UserPublic} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useInviteToLeague, useLeagueInvitables, useMe} from '@hooks';

import {InviteRow} from './components';
import {getResultsFromPages} from 'utils/api';
import {RootStackParamList} from 'routes/types';

const Wrapper = styled.View({flex: 1});

export const LeagueInviteFriends = (
  props: StackScreenProps<RootStackParamList, 'LeagueInviteFriends'>,
) => {
  const {leagueId} = props.route.params;

  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

  const [loadingUsers, setLoadingUsers] = useState<string[]>([]);

  const {
    data,
    isFetching,
    isFetchedAfterMount,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
  } = useLeagueInvitables(leagueId);

  const results = getResultsFromPages(data);

  const {data: me, isFetchedAfterMount: isMeFetchedAfterMount} = useMe();

  const {mutateAsync: inviteToLeague} = useInviteToLeague();

  const isUserLoading = (userId: string) => loadingUsers.includes(userId);

  async function handleInvitePressed(userId: string) {
    // Set user as loading user
    if (isUserLoading(userId)) return;
    setLoadingUsers(value => [...value, userId]);

    // Handle invite
    try {
      await inviteToLeague({leagueId, userId});
    } catch (e) {
      console.log(getErrors(e));
    } finally {
      // Remove user from loading array
      setLoadingUsers(value => {
        const newValues = [...value];

        const index = newValues.indexOf(userId);
        newValues.splice(index, 1);

        return newValues;
      });
    }
  }

  const handleOnRefresh = () => {
    refetch();
  };

  const renderItem = ({item}: {item: UserPublic}) => {
    return (
      <InviteRow
        userId={item.id as string}
        name={item.name as string}
        teamName={item.team_name}
        leagueNames={item.league_names}
        isInvited={!!item.invited}
        onInvitePressed={handleInvitePressed}
        avatarSource={item.avatar?.url_128x128}
        isLoading={isUserLoading(item.id)}
      />
    );
  };

  const keyExtractor = (item: UserPublic, index: number) =>
    item.id + index.toString();

  const ListFooterComponent = isFetchingNextPage ? (
    <BfitSpinner wrapperStyle={{height: 72}} />
  ) : null;

  const ListEmptyComponent = (
    <Label style={{textAlign: 'center', paddingHorizontal: 20, marginTop: 20}}>
      {me?.following_total
        ? "You don't have any friends with the right permissions to join this league."
        : "You don't follow anyone yet."}
    </Label>
  );

  const paddingTop = NAVBAR_HEIGHT + insets.top;

  return (
    <Wrapper>
      <Navbar backButtonIcon={'times'} title="Invite Friends" overlay />
      {isFetchedAfterMount && isMeFetchedAfterMount ? (
        <FlatList
          {...{
            keyExtractor,
            renderItem,
            ListEmptyComponent,
            ListFooterComponent,
          }}
          data={results}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,

            paddingTop: Platform.OS === 'ios' ? 0 : NAVBAR_HEIGHT + insets.top,
          }}
          contentInset={{top: paddingTop, left: 0, bottom: 0, right: 0}}
          contentOffset={{x: 0, y: -paddingTop}}
          automaticallyAdjustContentInsets={false}
          contentInsetAdjustmentBehavior={'never'}
          onEndReachedThreshold={0.2}
          onEndReached={() => fetchNextPage()}
          refreshControl={
            <RefreshControl
              progressViewOffset={NAVBAR_HEIGHT + insets.top}
              tintColor={colors.accent}
              refreshing={
                isFetching && isFetchedAfterMount && !isFetchingNextPage
              }
              onRefresh={handleOnRefresh}
            />
          }
        />
      ) : (
        <BfitSpinner wrapperStyle={styles.loadingWrapper} />
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
