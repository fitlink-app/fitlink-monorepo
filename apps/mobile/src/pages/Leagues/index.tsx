import React, {useCallback, useRef, useState} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {
  CommonActions,
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Route} from 'react-native-tab-view';
import styled, {useTheme} from 'styled-components/native';

import {SCREEN_CONTAINER_SPACE} from '@constants';
import {Label, PlotCard, TabView} from '@components';
import {useCteLeagues, useMe} from '@hooks';
import {widthLize} from '@utils';

import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import {getResultsFromPages} from 'utils/api';
import {RootStackParamList} from '../../routes/types';
import {ExploreLeagues, Invitations, MyLeagues} from './tabs';
import {IRefreshableTabHandle} from './tabs/types';
import {BOTTOM_TAB_BAR_HEIGHT} from '../../routes/Home/components';

const Wrapper = styled.View({
  flex: 1,
});

const PageTitle = styled(Label).attrs(() => ({
  type: 'subheading',
  appearance: 'accent',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontSize: 15,
  lineHeight: 18,
  textTransform: 'uppercase',
  textAlign: 'center',
  marginTop: 12,
});

export const Leagues = () => {
  const {colors} = useTheme();
  const {tab} =
    useRoute<RouteProp<RootStackParamList, 'Leagues'>>().params ?? {};
  const navigation = useNavigation();

  const tabViewRef = useRef<any>(null);
  const invitationsTabRef = useRef<IRefreshableTabHandle>(null);
  const exploreLeaguesTabRef = useRef<IRefreshableTabHandle>(null);
  const myLeaguesTabRef = useRef<IRefreshableTabHandle>(null);

  const [isManuallyRefetching, setIsManuallyRefetching] = useState(false);

  const insets = useSafeAreaInsets();
  const {data: me} = useMe({enabled: false});

  useFocusEffect(
    useCallback(() => {
      if (!!tabViewRef.current?.jumpToIndex && tab !== undefined) {
        tabViewRef.current.jumpToIndex(tab);
      }

      // Reset navigation params
      navigation.dispatch(CommonActions.setParams({tab: undefined}));
    }, [navigation, tab]),
  );

  const renderTabs = ({route, ...rest}: {route: Route}) => {
    switch (route.key) {
      case 'my_leagues':
        return <MyLeagues ref={myLeaguesTabRef} {...(rest as any)} />;
      case 'explore':
        return <ExploreLeagues ref={exploreLeaguesTabRef} {...(rest as any)} />;
      case 'invitations':
        return <Invitations ref={invitationsTabRef} {...(rest as any)} />;
      default:
        return null;
    }
  };

  const {
    data,
    isFetchedAfterMount,
    refetch: refetchC2ELeagues,
    fetchNextPage,
  } = useCteLeagues();

  const results = getResultsFromPages(data);

  const refresh = async () => {
    try {
      setIsManuallyRefetching(true);
      await Promise.all([
        refetchC2ELeagues(),
        myLeaguesTabRef?.current?.refresh(),
        exploreLeaguesTabRef?.current?.refresh(),
        invitationsTabRef?.current?.refresh(),
      ]);
    } catch (e) {
      console.warn('refresh leagues', e);
    } finally {
      setIsManuallyRefetching(false);
    }
  };

  return (
    <Wrapper style={{marginTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: BOTTOM_TAB_BAR_HEIGHT,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={isManuallyRefetching && isFetchedAfterMount}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }>
        <PageTitle>Leagues</PageTitle>
        <PlotCard.Calories
          wrapperStyle={styles.rewardCard}
          totalAmount={355}
          gainedPerDay={123}
          percentsPerDay={45.3}
        />
        <CteLeagueSlider
          leagues={results}
          onCardPress={(id, league) =>
            navigation.navigate('League', {id, league})
          }
          onEndReached={fetchNextPage}
          style={{marginBottom: SCREEN_CONTAINER_SPACE}}
        />
        <TabView
          ref={tabViewRef}
          routes={[
            {key: 'my_leagues', title: 'My Leagues'},
            {key: 'explore', title: 'Explore'},
            {
              key: 'invitations',
              title: 'Invitations',
              badgeCount: me?.league_invitations_total || 0,
            },
          ]}
          renderScene={renderTabs}
        />
      </ScrollView>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  rewardCard: {
    marginTop: 27,
    marginHorizontal: widthLize(20),
    marginBottom: SCREEN_CONTAINER_SPACE,
  },
});
