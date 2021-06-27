import React, {useState} from 'react';
import {Dimensions} from 'react-native';
import {
  TabView as CoreTabView,
  Route,
  SceneRendererProps,
} from 'react-native-tab-view';
import {TabBar} from './TabBar';

interface TabViewProps {
  routes: Array<Route & {badgeCount?: number}>;
  renderScene: (
    props: SceneRendererProps & {
      route: Route & {badgeCount?: number};
    },
  ) => React.ReactNode;
}

export const TabView = React.forwardRef(
  ({routes, renderScene}: TabViewProps, ref: any) => {
    // Nav state
    const [index, setIndex] = useState<number>(0);

    return (
      <CoreTabView
        ref={ref}
        lazy={true}
        renderTabBar={props => <TabBar {...props} />}
        initialLayout={{height: 0, width: Dimensions.get('window').width}}
        navigationState={{index, routes}}
        onIndexChange={setIndex}
        renderScene={renderScene}
      />
    );
  },
);
