import {TouchHandler} from '@components';
import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {
  Animated,
  StyleProp,
  TextStyle,
  ViewStyle,
  StyleSheet,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from './Icon';
import {Label, LabelProps} from './Label';

export const NAVBAR_HEIGHT = 40;

const Wrapper = styled.View({
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 20,
  position: 'absolute',
  top: 0,
  zIndex: 10,
});

const ContentContainer = styled.View({
  height: NAVBAR_HEIGHT,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Content = styled.View({
  justifyContent: 'center',
  paddingHorizontal: 5,
});

const BackButtonRow = styled.View({flexDirection: 'row'});

const BackButtonLabel = styled(Label).attrs({
  type: 'subheading',
  appearance: 'primary',
})({marginLeft: 15});

const Background = styled(Animated.View)({...StyleSheet.absoluteFillObject});

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

  /** Override icon color */
  iconColor?: string;

  /** Override title label props */
  titleProps?: Partial<LabelProps>;

  /** Override back button icon */
  backButtonIcon?: string;

  /** Optional label for back button */
  backButtonLabel?: string;

  /** Animate header BG opacity and title opacity based on ScrolLView content offset */
  scrollAnimatedValue?: Animated.Value;

  /** Set navbar title (if centerComponent is provided, title will be overridden) */
  title?: string;

  /** Set Style of Title */
  titleStyle?: StyleProp<TextStyle>;

  /** Set this as an overlay navbar so content can appear below it */
  overlay?: boolean;

  containerStyle?: any;
}

export const Navbar = ({
  leftComponent,
  rightComponent,
  centerComponent,
  backButtonIcon = 'arrow-left',
  backButtonLabel,
  title,
  titleStyle,
  iconColor,
  overlay,
  titleProps,
  scrollAnimatedValue,
  containerStyle,
}: NavbarProps) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const {colors} = useTheme();

  const overlayStyle: StyleProp<ViewStyle> = overlay
    ? {
        backgroundColor: colors.background,
      }
    : {};

  const fixedHeaderOpacity = scrollAnimatedValue
    ? scrollAnimatedValue.interpolate({
        inputRange: [25, 125],
        outputRange: [0, 0.8],
        extrapolate: 'clamp',
      })
    : 0.8;

  const animatedTitleOpacity = scrollAnimatedValue
    ? scrollAnimatedValue.interpolate({
        inputRange: [25, 125],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      })
    : 1;

  const AnimatedLabel = Animated.createAnimatedComponent(Label);

  const handleOnBackPressed = () => {
    navigation.goBack();
  };

  const renderBackButton = () => {
    return (
      <TouchHandler onPress={handleOnBackPressed}>
        <BackButtonRow>
          <Icon
            name={backButtonIcon}
            size={22}
            color={iconColor || colors.accent}
          />

          {!!backButtonLabel && (
            <BackButtonLabel>{backButtonLabel}</BackButtonLabel>
          )}
        </BackButtonRow>
      </TouchHandler>
    );
  };

  const renderTitle = () => {
    return (
      <AnimatedLabel
        appearance={'primary'}
        type={'caption'}
        bold
        numberOfLines={1}
        style={{
          ...(titleStyle as {}),
          textAlign: 'center',
          opacity: animatedTitleOpacity,
        }}
        {...titleProps}>
        {title}
      </AnimatedLabel>
    );
  };

  return (
    <Wrapper
      style={{
        paddingTop: insets.top,
        ...containerStyle,
      }}>
      <Background style={{...overlayStyle, opacity: fixedHeaderOpacity}} />

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
