import {Label} from '@components';
import React from 'react';
import {
  NavigationState,
  SceneRendererProps,
  TabBar as CoreTabBar,
  Route,
  TabBarIndicator,
} from 'react-native-tab-view';
import styled, {useTheme} from 'styled-components/native';

type State = NavigationState<Route>;

const LabelRow = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const BadgeWrapper = styled.View(({theme: {colors}}) => ({
  backgroundColor: colors.danger,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 50,
  height: 16,
  aspectRatio: '1',
  marginLeft: 5,
}));

const TabButton = ({
  focused,
  title,
  badgeCount,
}: {
  focused: boolean;
  title?: string;
  badgeCount?: number;
}) => {
  return (
    <LabelRow>
      <Label
        type={'subheading'}
        appearance={focused ? 'primary' : 'secondary'}
        style={{fontSize: 16}}>
        {title}
      </Label>
      {badgeCount ? (
        <BadgeWrapper>
          <Label type={'caption'} style={{color: 'white'}} bold>
            {badgeCount}
          </Label>
        </BadgeWrapper>
      ) : null}
    </LabelRow>
  );
};

export const TabBar = (
  props: SceneRendererProps & {navigationState: State},
) => {
  const {colors} = useTheme();

  return (
    <CoreTabBar
      {...props}
      renderIndicator={indicatorProps => {
        const {width} = indicatorProps;
        const widthPercentFloat = parseFloat(width as string);
        const marginPercent = 5;

        return (
          <TabBarIndicator
            {...indicatorProps}
            style={{
              width: `${widthPercentFloat - marginPercent}%`,
              left: `${marginPercent / 2}%`,
              backgroundColor: colors.accent,
              marginBottom: -1,
              height: 2,
            }}
          />
        );
      }}
      style={{
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderColor: colors.separator,
        elevation: 0,
      }}
      renderLabel={(params): Element => {
        const {focused} = params;
        const route = params.route as Route & {badgeCount: number};

        return (
          <TabButton
            {...{focused}}
            title={route.title}
            badgeCount={route.badgeCount}
          />
        ) as any;
      }}
    />
  );
};
