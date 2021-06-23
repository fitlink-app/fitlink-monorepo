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
import {Following, Search} from './tabs';
import {TabView} from '@components';

const Wrapper = styled.View({
  flex: 1,
});

export const Friends = (
  props: StackScreenProps<RootStackParamList, 'Friends'>,
) => {
  const tab = props?.route?.params?.tab;

  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const tabViewRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      console.log(tabViewRef.current.jumpToIndex);
      console.log(tab);
      if (!!tabViewRef.current?.jumpToIndex && tab !== undefined)
        tabViewRef.current.jumpToIndex(tab);

      // Reset navigation params
      navigation.dispatch(CommonActions.setParams({tab: undefined}));
    }, [tab]),
  );

  const renderTabs = ({route, ...rest}: {route: Route}) => {
    switch (route.key) {
      case 'following':
        return <Following {...rest} />;

      case 'followers':
        return <Following {...rest} />;

      case 'search':
        return <Search {...rest} />;
      default:
        return null;
    }
  };

  return (
    <Wrapper style={{marginTop: insets.top}}>
      <TabView
        ref={tabViewRef}
        routes={[
          {key: 'following', title: 'Following'},
          {key: 'followers', title: 'My Followers'},
          {key: 'search', title: 'Search'},
        ]}
        renderScene={renderTabs}
      />
    </Wrapper>
  );
};
