import {Label, PlotCard, TabView} from '@components';
import {useCteLeagues, useMe} from '@hooks';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {widthLize} from '@utils';
import {CteLeagueSlider} from 'components/league/CteLeagueSlider';
import React, {useCallback, useRef} from 'react';
import {RefreshControl, ScrollView, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Route} from 'react-native-tab-view';
import styled, {useTheme} from 'styled-components/native';
import {getResultsFromPages} from 'utils/api';
import {RootStackParamList} from '../../routes/types';
import {ExploreLeagues, Invitations, MyLeagues} from './tabs';

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

const StyledCteLeagueSlider = styled(CteLeagueSlider)({
  marginTop: 41,
});

export const Leagues = (
  props: StackScreenProps<RootStackParamList, 'Leagues'>,
) => {
  const {colors} = useTheme();
  const tab = props?.route?.params?.tab;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const tabViewRef = useRef<any>(null);

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
        return <MyLeagues {...(rest as any)} />;

      case 'explore':
        return <ExploreLeagues {...(rest as any)} />;

      case 'invitations':
        return <Invitations {...(rest as any)} />;
      default:
        return null;
    }
  };

  const {data, isFetching, isFetchedAfterMount, refetch, fetchNextPage} =
    useCteLeagues();

  const results = getResultsFromPages(data);

  return (
    <Wrapper style={{marginTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 79,
        }}
        refreshControl={
          <RefreshControl
            onRefresh={refetch}
            refreshing={isFetching && isFetchedAfterMount}
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
        <StyledCteLeagueSlider
          leagues={results}
          onCardPress={(id, league) =>
            navigation.navigate('League', {id, league})
          }
          onEndReached={fetchNextPage}
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
    marginHorizontal: widthLize(20),
    marginTop: 27,
  },
});
