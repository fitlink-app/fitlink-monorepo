import React, {useCallback, useRef} from 'react';
import {ScrollView, Image} from 'react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Route} from 'react-native-tab-view';
import {StackScreenProps} from '@react-navigation/stack';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from 'routes/types';
import {ExploreLeagues, Invitations, MyLeagues} from './tabs';
import {TabView, Label, Card, TouchHandler} from '@components';
import {useMe} from '@hooks';

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
});

const RankCard = styled(Card)({
  width: '100%',
  marginTop: 20,
  height: 120,
  paddingTop: 24,
  paddingLeft: 33,
  paddingRight: 33,
});

const CardRow = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Rank = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 2,
  textTransform: 'uppercase',
  color: '#565656',
});

const Percentage = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontSize: 15,
  lineHeight: 18,
  letterSpacing: 2,
});

const RankNumber = styled(Label).attrs(() => ({
  type: 'title',
}))({
  fontFamily: 'Roboto',
  fontSize: 42,
  lineHeight: 48,
});

const LeaguesTitleContainer = styled.View({
  marginTop: 41,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
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
  },
}))({});

const CardContainer = styled(Card)({
  width: 327,
  height: 350,
  marginTop: 23,
  marginRight: 14,
  marginBottom: 20,
  overflow: 'hidden',
});

const CardImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Bfit = styled.View({
  marginTop: 24,
  marginLeft: 24,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 12,
  paddingRight: 12,
  borderRadius: 20,
  backgroundColor: '#060606',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
});

const BfitValue = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 2,
  textAlign: 'center',
});

const Line = styled.View({
  position: 'relative',
  width: '100%',
  height: 2,
  backgroundColor: '#ffffff',
  marginTop: 209,
  border: 0,
  opacity: 0.2,
});

const CardInfo = styled.View({
  position: 'relative',
  width: '100%',
  height: 87,
  paddingTop: 20,
  paddingLeft: 24,
  paddingBottom: 22,
  paddingRight: 24,
  backgroundColor: 'rgba(255,255,255,0.2)',
});

const MembersText = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  position: 'relative',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
});

const PlaceSection = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 7,
});

const CompeteName = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 18,
  lineHeight: 21,
});

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
      if (!!tabViewRef.current?.jumpToIndex && tab !== undefined)
        tabViewRef.current.jumpToIndex(tab);

      // Reset navigation params
      navigation.dispatch(CommonActions.setParams({tab: undefined}));
    }, [tab]),
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
          paddingHorizontal: 10,
          paddingBottom: 20,
        }}>
        <PageTitle>Gold Leagues</PageTitle>
        <RankCard>
          <CardRow>
            <Rank>Total Rank</Rank>
            <Percentage>+10P</Percentage>
          </CardRow>
          <CardRow>
            <RankNumber>37640</RankNumber>
            <Image
              source={require('../../../assets/images/total_rank_chart.png')}
            />
          </CardRow>
        </RankCard>
        <LeaguesTitleContainer>
          <Title>Compete to earn leagues</Title>
          <TouchHandler>
            <SeeAllText>see all</SeeAllText>
          </TouchHandler>
        </LeaguesTitleContainer>
        <SliderContainer>
          <>
            {compete_data.map(({bfit, members, compete_name, img}) => (
              <CardContainer>
                <CardImage source={img} />
                <Row>
                  <Bfit>
                    <BfitValue>{bfit} $BFIT</BfitValue>
                  </Bfit>
                </Row>
                <Line />
                <CardInfo>
                  <MembersText>
                    <Label appearance="accent">{members}</Label> Members
                  </MembersText>
                  <PlaceSection>
                    <CompeteName>{compete_name}</CompeteName>
                  </PlaceSection>
                </CardInfo>
              </CardContainer>
            ))}
          </>
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
