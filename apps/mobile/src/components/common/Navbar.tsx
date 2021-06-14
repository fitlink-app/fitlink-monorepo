import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from './Icon';

export const NAVBAR_HEIGHT = 40;

const Wrapper = styled.View({
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
});

const ContentContainer = styled.View({
  height: NAVBAR_HEIGHT,
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const Content = styled.View({justifyContent: 'center', paddingHorizontal: 5});

const LeftContent = styled(Content)({flex: 1, alignItems: 'flex-start'});

const RightContent = styled(Content)({flex: 1, alignItems: 'flex-end'});

interface NavbarProps {
  disableBackButton?: boolean;

  /** Override navbar left component */
  leftComponent?: JSX.Element;

  /** Override navbar right component */
  rightComponent?: JSX.Element;

  /** Override navbar center component */
  centerComponent?: JSX.Element;
}

export const Navbar = ({
  leftComponent,
  rightComponent,
  centerComponent,
}: NavbarProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const handleOnBackPressed = () => {
    navigation.goBack();
  };

  const renderBackButton = () => {
    return (
      <Icon
        name={'arrow-left'}
        size={22}
        color={colors.accent}
        onPress={handleOnBackPressed}
      />
    );
  };

  return (
    <Wrapper style={{paddingTop: insets.top}}>
      <ContentContainer>
        <LeftContent>
          {leftComponent ? leftComponent : renderBackButton()}
        </LeftContent>

        <Content>{centerComponent}</Content>

        <RightContent>{rightComponent}</RightContent>
      </ContentContainer>
    </Wrapper>
  );
};
