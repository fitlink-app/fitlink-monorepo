import React, {useCallback, useRef} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Route} from 'react-native-tab-view';
import {StackScreenProps} from '@react-navigation/stack';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {RootStackParamList} from 'routes/types';
import {Following, Followers, Search} from './tabs';
import {Navbar, TabView} from '@components';
import {useMe} from '@hooks';

const Wrapper = styled.View({
  flex: 1,
});

const HeaderView = styled.View({
  // position: 'absolute',
});

export const Friends = (
  props: StackScreenProps<RootStackParamList, 'Friends'>,
) => {
  const tab = props?.route?.params?.tab;

  const {colors} = useTheme();

  const navigation = useNavigation();

  const tabViewRef = useRef<any>(null);

  const {data: user} = useMe();

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
      <Wrapper>
        <TabView
          ref={tabViewRef}
          routes={[
            {
              key: 'followers',
              title: 'FOLLOWERS',
              peopleCount: user?.followers_total || 0,
            },
            {
              key: 'following',
              title: 'FOLLOWING',
              peopleCount: user?.following_total || 0,
            },
            {key: 'search', title: 'SEARCH'},
          ]}
          renderScene={renderTabs}
        />
      </Wrapper>
    </>
  );
};
