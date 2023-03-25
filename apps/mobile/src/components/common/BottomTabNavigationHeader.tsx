import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useRoute} from '@react-navigation/native';

import theme from '@theme';
import {BottomTabParamList} from '@routes';

import {Label} from './Label';

const routeToTitleMap: Partial<Record<keyof BottomTabParamList, string>> = {
  ActivityFeed: 'Feed',
  Leagues: 'Leagues',
  Rewards: 'Rewards',
};

interface BottomTabNavigationHeaderProps {
  buttonLeft?: JSX.Element;
  buttonRight?: JSX.Element;
}

export const BottomTabNavigationHeader = ({
  buttonLeft,
  buttonRight,
}: BottomTabNavigationHeaderProps) => {
  const route = useRoute();

  return (
    <View style={styles.headerContainer}>
      {buttonLeft}
      <Label style={styles.pageTitle}>{routeToTitleMap[route.name]}</Label>
      {buttonRight}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 27,
  },
  pageTitle: {
    color: theme.colors.accent,
    fontFamily: 'Roboto',
    fontSize: 15,
    lineHeight: 18,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  buttonRight: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
});
