import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from './Icon';
import {Label} from './Label';

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

const Title = styled(Label).attrs(() => ({
  appearance: 'primary',
  type: 'caption',
  bold: true,
  numberOfLines: 1,
}))({
  textAlign: 'center',
});

interface NavbarProps {
  disableBackButton?: boolean;

  /** Override navbar left component */
  leftComponent?: JSX.Element;

  /** Override navbar right component */
  rightComponent?: JSX.Element;

  /** Override navbar center component */
  centerComponent?: JSX.Element;

  /** Override back button icon */
  backButtonIcon?: string;

  /** Set navbar title (if centerComponent is provided, title will be overridden) */
  title?: string;

  /** Set this as an overlay navbar so content can appear below it */
  overlay?: boolean;
}

export const Navbar = ({
  leftComponent,
  rightComponent,
  centerComponent,
  backButtonIcon = 'arrow-left',
  title,
  overlay,
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
        name={backButtonIcon}
        size={22}
        color={colors.accent}
        onPress={handleOnBackPressed}
      />
    );
  };

  const renderTitle = () => {
    return <Title>{title}</Title>;
  };

  const overlayStyle: StyleProp<ViewStyle> = overlay
    ? {
        position: 'absolute',
        top: 0,
        zIndex: 10,
        backgroundColor: `${colors.background}CC`,
      }
    : {};

  return (
    <Wrapper
      style={{
        paddingTop: insets.top,
        ...overlayStyle,
      }}>
      <ContentContainer>
        <LeftContent>
          {leftComponent ? leftComponent : renderBackButton()}
        </LeftContent>

        <Content>{title ? renderTitle() : centerComponent}</Content>

        <RightContent>{rightComponent}</RightContent>
      </ContentContainer>
    </Wrapper>
  );
};
