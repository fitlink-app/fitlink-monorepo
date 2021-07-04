import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from 'styled-components/native';
import {Icon} from '@components';
import {BottomTabBar} from './components';
import {Feed, Friends} from 'pages';

const Tab = createBottomTabNavigator();

export const HomeNavigator = () => {
  const {colors} = useTheme();

  const renderTabIcon = (focused: boolean, name: string) => {
    return (
      <Icon
        name={name}
        color={focused ? colors.accent : colors.accentSecondary}
        size={26}
      />
    );
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
        name="Friends"
        component={Friends}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'friends'),
        }}
      />

      <Tab.Screen
        name="Leagues"
        component={Feed}
        options={{
          tabBarBadge: 8,
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'leagues'),
        }}
      />

      <Tab.Screen
        name="Rewards"
        component={Feed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'reward'),
        }}
      />

      <Tab.Screen
        name="Discover"
        component={Feed}
        options={{
          tabBarIcon: ({focused}) => renderTabIcon(focused, 'activities'),
        }}
      />
    </Tab.Navigator>
  );
};
