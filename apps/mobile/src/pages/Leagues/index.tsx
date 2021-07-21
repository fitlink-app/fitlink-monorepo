import React, {useCallback, useRef} from 'react';
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
import {TabView} from '@components';

const Wrapper = styled.View({
  flex: 1,
});

export const Leagues = (
  props: StackScreenProps<RootStackParamList, 'Leagues'>,
) => {
  const tab = props?.route?.params?.tab;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const tabViewRef = useRef<any>(null);

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
      <TabView
        ref={tabViewRef}
        routes={[
          {key: 'my_leagues', title: 'My Leagues'},
          {key: 'explore', title: 'Explore'},
          {key: 'invitations', title: 'Invitations'},
        ]}
        renderScene={renderTabs}
      />
    </Wrapper>
  );
};
