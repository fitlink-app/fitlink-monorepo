import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import styled from 'styled-components/native';
import {View, Pressable, Platform} from 'react-native';

import {Label} from '@components';
import theme from '@theme';

export const BOTTOM_TAB_BAR_HEIGHT = 72;

const Wrapper = styled.View(() => ({
  width: '100%',
  height: BOTTOM_TAB_BAR_HEIGHT,
}));

const Container = styled.View(({theme}) => ({
  alignSelf: 'center',
  height: '100%',
  backgroundColor: theme.colors.background,
  flexDirection: 'row',
}));

const Button = styled(Pressable)({
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  paddingVertical: 8,
});

const BadgeContainer = styled.View(({theme}) => ({
  position: 'absolute',
  right: -10,
  top: -5,
  height: 16,
  width: 16,
  borderRadius: 999,
  backgroundColor: theme.colors.danger,
  justifyContent: 'center',
  alignItems: 'center',
}));

export const BottomTabBar = (props: BottomTabBarProps) => {
  const {state, descriptors, navigation} = props;

  function renderButtons() {
    return state.routes.map((route, index) => {
      const {options} = descriptors[route.key];

      const isFocused = state.index === index;

      const onPress = () => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
          navigation.navigate(route.name);
        }
      };

      const onLongPress = () => {
        navigation.emit({
          type: 'tabLongPress',
          target: route.key,
        });
      };

      const renderIcon = (isFocused: boolean) => {
        const {tabBarBadge, tabBarIcon} = options;

        const Badge = () => {
          if (!tabBarBadge) {
            return null;
          }

          return (
            <BadgeContainer>
              <Label appearance={'primary'} bold style={{fontSize: 11}}>
                {tabBarBadge}
              </Label>
            </BadgeContainer>
          );
        };

        if (!tabBarIcon) {
          return null;
        }
        return (
          <View>
            {tabBarIcon({focused: isFocused, color: '', size: 30})}
            <Badge />
          </View>
        );
      };

      return (
        <Button
          style={{margin: 5}}
          key={index}
          accessibilityRole="button"
          accessibilityLabel={options.tabBarAccessibilityLabel}
          testID={options.tabBarTestID}
          onPress={onPress}
          onLongPress={onLongPress}
        >
          {renderIcon(isFocused)}
        </Button>
      );
    });
  }

  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.accent,
        overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        borderTopWidth: 1,
        borderTopColor: theme.colors.card,
      }}
    >
      <Wrapper>
        <Container>{renderButtons()}</Container>
      </Wrapper>
    </View>
  );
};
