import {Label, TabView, TouchHandler} from '@components';
import {useMe} from '@hooks';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import {widthLize} from '@utils';
import {CteLeagueCard} from 'components/league/LeagueCard/CteLeagueCard';
import {CaloriesCard} from 'pages/Feed/components/CaloriesCard';
import React, {useCallback, useRef} from 'react';
import {ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Route} from 'react-native-tab-view';
import {RootStackParamList} from 'routes/types';
import styled from 'styled-components/native';
import {ExploreLeagues, Invitations, MyLeagues} from './tabs';

const Wrapper = styled.View({
  flex: 1,
});

const StyledCteLeagueCard = styled(CteLeagueCard)({
  marginTop: 23,
  marginRight: 14,
  marginBottom: 20,
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

const LeaguesTitleContainer = styled.View({
  marginTop: 41,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginHorizontal: widthLize(20),
});

const Title = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#ffffff',
});

const SeeAllText = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 1,
  textTransform: 'capitalize',
  color: '#ACACAC',
});

const SliderContainer = styled.ScrollView.attrs(() => ({
  horizontal: true,
  overScrollMode: 'never',
  showsHorizontalScrollIndicator: false,
  contentContainerStyle: {
    justifyContent: 'space-between',
    paddingLeft: widthLize(20),
  },
}))({});

const compete_data = [
  {
    id: 1,
    bfit: 40,
    members: 1117,
    compete_name: 'Global Steps Challenge',
    img: require('../../../assets/images/leagues/laufen-running-EVO-Fitness.png'),
  },
  {
    id: 2,
    bfit: 40,
    members: 293,
    compete_name: 'Your Daily Yoga',
    img: require('../../../assets/images/leagues/nature-zen.png'),
  },
  {
    id: 3,
    bfit: 40,
    members: 293,
    compete_name: 'Your Daily Yoga',
    img: require('../../../assets/images/leagues/josh-duke.png'),
  },
  {
    id: 4,
    bfit: 40,
    members: 300,
    compete_name: 'Every Morning Run',
    img: require('../../../assets/images/leagues/mike-cox.png'),
  },
];

export const Leagues = (
  props: StackScreenProps<RootStackParamList, 'Leagues'>,
) => {
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

  return (
    <Wrapper style={{marginTop: insets.top}}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 79,
        }}>
        <PageTitle>Gold Leagues</PageTitle>
        <View style={{marginHorizontal: widthLize(20)}}>
          {/* <RankCard /> */}
          <CaloriesCard />
        </View>
        <LeaguesTitleContainer>
          <Title>Compete to earn leagues</Title>
          <TouchHandler>
            <SeeAllText>see all</SeeAllText>
          </TouchHandler>
        </LeaguesTitleContainer>
        <SliderContainer>
          {compete_data.map(({bfit, members, compete_name, img}) => (
            <StyledCteLeagueCard
              bfitValue={bfit}
              memberCount={members}
              name={compete_name}
              imageUrl={img}
            />
          ))}
        </SliderContainer>
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
