import React from 'react';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import styled from 'styled-components/native';
import {View, Pressable, Platform, SafeAreaView} from 'react-native';
import {Label} from '@components';
import {widthLize} from '@utils';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Wrapper = styled.View(() => ({
  width: '100%',
  height: 79,
}));

const Container = styled.View(({theme}) => ({
  alignSelf: 'center',
  width: widthLize(358),
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
      // const label =
      //   options.tabBarLabel !== undefined
      //     ? options.tabBarLabel
      //     : options.title !== undefined
      //     ? options.title
      //     : route.name;

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

  const insets = useSafeAreaInsets();
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <SafeAreaView
      style={{
        backgroundColor: 'transparent',
        overflow: Platform.OS === 'ios' ? 'visible' : 'hidden',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + 10,
        zIndex: 2,
      }}>
      <Wrapper>
        <Container>{renderButtons()}</Container>
      </Wrapper>
    </SafeAreaView>
  );
};
