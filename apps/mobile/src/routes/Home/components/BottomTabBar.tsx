import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import {View, Pressable, Platform} from 'react-native';
import {Label} from '@components';

const Wrapper = styled.View(({theme}) => ({
  width: '100%',
  height: 79,
  paddingLeft: 25,
  paddingRight: 25,
}));

const Container = styled.View(({theme}) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.colors.navbar,
  flexDirection: 'row',
  borderRadius: 24,
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
      const label =
        options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

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
          if (!tabBarBadge) return null;

          return (
            <BadgeContainer>
              <Label appearance={'primary'} bold style={{fontSize: 11}}>
                {tabBarBadge}
              </Label>
            </BadgeContainer>
          );
        };

        if (!tabBarIcon) return null;
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
          onLongPress={onLongPress}>
          {renderIcon(isFocused)}
          {/* <Label
            style={{marginTop: 5, fontSize: 11}}
            bold={isFocused}
            appearance={isFocused ? 'accent' : 'accentSecondary'}>
            {label}
          </Label> */}
        </Button>
      );
    });
  }

  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  // Insets from SafeAreaProvider
  const insets = useSafeAreaInsets();

  return (
    <Wrapper>
      <Container
        style={{
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : undefined,
        }}>
        {renderButtons()}
      </Container>
    </Wrapper>
  );
};
