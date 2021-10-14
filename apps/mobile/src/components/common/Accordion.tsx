import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, LayoutAnimation, ViewStyle} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Icon, TouchHandler, Label} from '.';

interface AccordionProps {
  title: string;
  subtitle?: string;
  showByDefault?: boolean;
  style?: ViewStyle;
}

const Wrapper = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ContentContainer = styled.View({});

const IconContainer = styled.View({
  width: 40,
  height: 35,
  alignSelf: 'flex-end',
  alignItems: 'center',
  justifyContent: 'center',
});

export const Accordion: React.FC<AccordionProps> = ({
  children,
  showByDefault,
  title,
  subtitle,
  style,
}) => {
  const {colors} = useTheme();

  const rotationValue = useRef(new Animated.Value(0)).current;

  const [isShown, setShown] = useState(!!showByDefault);

  useEffect(() => {
    animateIcon(isShown ? 1 : 0);
  }, [isShown]);

  function animateIcon(value: number) {
    Animated.timing(rotationValue, {
      toValue: value,
      duration: 125,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }

  const animatedIconRotation = rotationValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '-90deg'],
  });

  return (
    <>
      <TouchHandler
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setShown(!isShown);
        }}>
        <Wrapper {...style}>
          <Label type={'title'}>
            {title}{' '}
            <Label type={'subheading'} appearance={'secondary'}>
              {subtitle}
            </Label>
          </Label>
          <IconContainer>
            <Animated.View
              style={{transform: [{rotate: animatedIconRotation}]}}>
              <Icon
                name={'arrow-right'}
                color={colors.accentSecondary}
                size={18}
              />
            </Animated.View>
          </IconContainer>
        </Wrapper>
      </TouchHandler>

      {isShown && <ContentContainer>{children}</ContentContainer>}
    </>
  );
};
