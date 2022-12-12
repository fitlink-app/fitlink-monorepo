import React, {useCallback, useRef} from 'react';
import {ScrollView, Text, View} from 'react-native';
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
import {BlurView} from '@react-native-community/blur';
import {RankCard} from './components/RankCard';
import {widthLize} from "@utils";

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
});

const MembersText = styled(Text)({
  position: 'relative',
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontSize: 14,
  lineHeight: 16,
  letterSpacing: 1,
  textTransform: 'uppercase',
  color: '#FFFFFF',
});

const CompeteName = styled(Text)({
  fontFamily: 'Roboto',
  fontStyle: 'normal',
  fontSize: 17,
  lineHeight: 21,
  color: '#FFFFFF',
  marginTop: 7,
  textAlign: 'left',
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
      if (!!tabViewRef.current?.jumpToIndex && tab !== undefined) {
        tabViewRef.current.jumpToIndex(tab);
      }

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
          paddingBottom: 79,
        }}>
        <PageTitle>Gold Leagues</PageTitle>
        <View style={{marginHorizontal: widthLize(20)}}>
          <RankCard />
        </View>
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
                  <BlurView
                    style={{
                      position: 'absolute',
                      width: 327,
                      height: 87,
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                    blurRadius={1}
                    blurAmount={1}
                    blurType="dark"
                    overlayColor={'transparent'}
                  />
                  <MembersText>
                    <Text style={{color: '#00E9D7'}}>{members}</Text> Members
                  </MembersText>
                  <CompeteName>{compete_name}</CompeteName>
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
