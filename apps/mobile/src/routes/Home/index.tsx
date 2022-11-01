import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import styled, {useTheme} from 'styled-components/native';
import {BottomTabBar} from './components';
import {Discover, Feed, ActivityFeed, Leagues, Rewards} from 'pages';
import {useMe} from '@hooks';

const HomeIcon = require('../../../assets/images/icon/navigator-icons/home.png');
const HomeActiveIcon = require('../../../assets/images/icon/navigator-icons/home-active.png');
const FriendsIcon = require('../../../assets/images/icon/navigator-icons/users.png');
const FriendsActiveIcon = require('../../../assets/images/icon/navigator-icons/users-active.png');
const LeaguesIcon = require('../../../assets/images/icon/navigator-icons/award.png');
const LeaguesActiveIcon = require('../../../assets/images/icon/navigator-icons/award-active.png');
const RewardsIcon = require('../../../assets/images/icon/navigator-icons/gift.png');
const RewardsActiveIcon = require('../../../assets/images/icon/navigator-icons/gift-active.png');
const DiscoverIcon = require('../../../assets/images/icon/navigator-icons/map.png');
const DiscoverActiveIcon = require('../../../assets/images/icon/navigator-icons/map-active.png');

const Tab = createBottomTabNavigator();

const IconImage = styled.Image({
  width: 24,
  height: 24,
});

export const HomeNavigator = () => {
  const {colors} = useTheme();
  const {data: me} = useMe({enabled: false});

  const renderTabIcon = (focused: boolean, name: string) => {
    switch (name) {
      case 'home':
        return <IconImage source={focused ? HomeActiveIcon : HomeIcon} />;
      case 'friends':
        return <IconImage source={focused ? FriendsActiveIcon : FriendsIcon} />;
      case 'leagues':
        return <IconImage source={focused ? LeaguesActiveIcon : LeaguesIcon} />;
      case 'reward':
        return <IconImage source={focused ? RewardsActiveIcon : RewardsIcon} />;
      case 'discover':
        return (
          <IconImage source={focused ? DiscoverActiveIcon : DiscoverIcon} />
        );

      default:
        return <IconImage source={HomeIcon} />;
    }
  };

  return (
    <Tab.Navigator
      sceneContainerStyle={{backgroundColor: colors.background}}
      tabBar={props => <BottomTabBar {...props} />}>
      <Tab.Screen
        name="Feed"
        component={Feed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'home'),
        }}
      />

      <Tab.Screen
        name="ActivityFeed"
        component={ActivityFeed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'friends'),
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
