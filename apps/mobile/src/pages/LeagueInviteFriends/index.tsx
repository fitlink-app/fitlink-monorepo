import React, {useEffect} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {RootStackParamList} from 'routes/types';
import {StackScreenProps} from '@react-navigation/stack';
import {FlatList, InteractionManager, RefreshControl} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Label, Navbar, NAVBAR_HEIGHT} from '@components';
import {InviteRow} from './components';
import {User} from '@fitlink/api/src/modules/users/entities/user.entity';
import {useLeagueInvitables} from '@hooks';

const Wrapper = styled.View({flex: 1});

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
  } = useLeagueInvitables(leagueId);

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

  const renderItem = ({item}: {item: User}) => {
    return (
      <InviteRow
        userId={item.id as string}
        name={item.name as string}
        isInvited={false}
        onInvitePressed={handleInvitePressed}
        avatarSource={item.avatar.url_128x128}
        isLoading={false}
      />
    );
  };

  const keyExtractor = (item: User, index: number) =>
    item.id + index.toString();

  const ListEmptyComponent = (
    <Label style={{textAlign: 'center'}}>You don't follow anyone yet.</Label>
  );

  const paddingTop = NAVBAR_HEIGHT + insets.top;

  return (
    <Wrapper>
      <Navbar backButtonIcon={'times'} title="Invite Friends" overlay />
      <FlatList
        {...{keyExtractor, renderItem, ListEmptyComponent, data}}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={isFetching}
            onRefresh={handleOnRefresh}
          />
        }
      />
    </Wrapper>
  );
};
