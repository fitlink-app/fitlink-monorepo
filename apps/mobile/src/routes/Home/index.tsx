import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import styled, {useTheme} from 'styled-components/native';

import {useMe} from '@hooks';
import theme from '@theme';

import {BottomTabBar} from './components';
import {ActivityFeed, Discover, Feed, Leagues, Rewards, Wallet} from 'pages';
import WalletIcon from '../../components/icons/WalletIcon';

const HomeIcon = require('../../../assets/images/icon/navigator-icons/home.png');
const ActivityIcon = require('../../../assets/images/icon/navigator-icons/users.png');
const LeaguesIcon = require('../../../assets/images/icon/navigator-icons/award.png');
const RewardsIcon = require('../../../assets/images/icon/navigator-icons/gift.png');
const DiscoverIcon = require('../../../assets/images/icon/navigator-icons/map.png');

const Tab = createBottomTabNavigator();

const IconImage = styled.Image({
  width: 24,
  height: 24,
});

const renderTabIcon = (focused: boolean, name: string) => {
  const tintColor = focused ? theme.colors.accent : theme.colors.text;
  switch (name) {
    case 'home':
      return <IconImage style={{tintColor}} source={HomeIcon} />;
    case 'wallet':
      return <WalletIcon color={tintColor} />;
    case 'activityfeed':
      return <IconImage style={{tintColor}} source={ActivityIcon} />;
    case 'leagues':
      return <IconImage style={{tintColor}} source={LeaguesIcon} />;
    case 'reward':
      return <IconImage style={{tintColor}} source={RewardsIcon} />;
    case 'discover':
      return <IconImage style={{tintColor}} source={DiscoverIcon} />;
    default:
      return <IconImage source={HomeIcon} />;
  }
};

export const HomeNavigator = () => {
  const {colors} = useTheme();
  const {data: me} = useMe({enabled: false});

  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: colors.background}}
      tabBar={props => <BottomTabBar {...props} />}
    >
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'home'),
        }}
      />

      <Tab.Screen
        name="Wallet"
        component={Wallet}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'wallet'),
        }}
      />

      <Tab.Screen
        name="ActivityFeed"
        component={ActivityFeed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'activityfeed'),
        }}
      />

      <Tab.Screen
        name="Leagues"
        component={Leagues}
        options={{
          tabBarBadge: me?.league_invitations_total || 0,
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'leagues'),
        }}
      />

      <Tab.Screen
        name="Rewards"
        component={Rewards}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'reward'),
        }}
      />

      <Tab.Screen
        name="Discover"
        component={Discover}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'discover'),
        }}
      />
    </Tab.Navigator>
  );
};
