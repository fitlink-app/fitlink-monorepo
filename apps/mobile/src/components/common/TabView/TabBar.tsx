import {Label} from '@components';
import React from 'react';
import {Dimensions, View} from 'react-native';
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
  backgroundColor: '',
  justifyContent: 'center',
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
  peopleCount,
}: {
  focused: boolean;
  title?: string;
  badgeCount?: number;
  peopleCount?: number;
}) => {
  return (
    <View style={{height: 36}}>
      <LabelRow>
        <Label
          type={'subheading'}
          appearance={
            peopleCount || title === 'SEARCH'
              ? focused
                ? 'accent'
                : 'secondary'
              : focused
              ? 'primary'
              : 'secondary'
          }
          style={{fontSize: 16}}
          numberOfLines={1}>
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
    </View>
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
        const marginPercent = 10;

        return (
          <TabBarIndicator
            {...indicatorProps}
            style={{
              width: 36,
              left: `${(widthPercentFloat - marginPercent) / 2}%`,
              backgroundColor: colors.accent,
              marginBottom: 10,
              height: 3,
            }}
          />
        );
      }}
      style={{
        backgroundColor: 'transparent',
        borderBottomWidth: 1,
        borderColor: 'transparent',
        elevation: 0,
        marginHorizontal: 20,
      }}
      renderLabel={(params): Element => {
        const {focused} = params;
        const route = params.route as Route & {
          badgeCount: number;
          peopleCount: number;
        };

        return (
          <TabButton
            {...{focused}}
            title={route.title}
            badgeCount={route.badgeCount}
            peopleCount={route.peopleCount}
          />
        ) as any;
      }}
    />
  );
};
