import React, {useCallback, useRef} from 'react';
import styled from 'styled-components/native';
import {Route} from 'react-native-tab-view';
import {StackScreenProps} from '@react-navigation/stack';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from 'routes/types';
import {Following, Followers, Search} from './tabs';
import {TabView} from '@components';

const Wrapper = styled.View({
  flex: 1,
  marginTop: 40
});

const HeaderView = styled.View({
  position: 'absolute',
  width: '100%',
  height: 120,
  background: '#181818',
  borderBottomLeftRadius: 31,
  borderBottomRightRadius: 31,
});

export const Friends = (
  props: StackScreenProps<RootStackParamList, 'Friends'>,
) => {
  const tab = props?.route?.params?.tab;

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
      case 'following':
        return <Following {...(rest as any)} />;

      case 'followers':
        return <Followers {...(rest as any)} />;

      case 'search':
        return <Search {...rest} />;
      default:
        return null;
    }
  };

  return (
    <>
      <HeaderView />
      <Wrapper>
        <TabView
          ref={tabViewRef}
          routes={[
            {key: 'followers', title: 'FOLLOWERS', peopleCount: 10},
            {key: 'following', title: 'FOLLOWING', peopleCount: 20},
            {key: 'search', title: 'SEARCH'},
          ]}
          renderScene={renderTabs}
        />
      </Wrapper>
    </>
  );
};
