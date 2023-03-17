import React, {FC} from 'react';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import {BIOMETRY_TYPE} from 'react-native-keychain';

import theme from '@theme';
import {PIN_LENGTH} from '@constants';

import {useAnimationOnError} from './hooks';
import PinInputDigits from './PinInputDigits';
import AuthNumberPad from './AuthNumberPad';

export interface IPinCodeViewProps {
  pin: string;
  biometryType?: BIOMETRY_TYPE | null;
  title?: string;
  subtitle?: string;
  error?: string | boolean;
  shouldAnimateOnError?: boolean;

  onBiometry?(): void;
  onPinChange(value: string): void;
}

export const PinCodeView: FC<IPinCodeViewProps> = ({
  pin,
  biometryType = null,
  error,
  title,
  subtitle,
  children,
  shouldAnimateOnError = false,

  onBiometry,
  onPinChange,
}) => {
  const {animatedStyle} = useAnimationOnError(error);

  const onPress = (value: string) => {
    if (pin.length === PIN_LENGTH) {
      onPinChange(value);
      return;
    }
    onPinChange(`${pin}${value}`);
  };

  const onDelete = () => {
    if (!pin.length) {
      return;
    }
    onPinChange(pin.slice(0, pin.length - 1));
  };

  return (
    <SWrapper>
      <SAnimatedContainer style={shouldAnimateOnError && animatedStyle}>
        <STitleWrapper>
          {title && <STitle>{title}</STitle>}
          {subtitle && <SSubtitle>{subtitle}</SSubtitle>}
        </STitleWrapper>
        <SContent>
          <PinInputDigits
            pin={pin}
            isError={Boolean(error)}
            length={PIN_LENGTH}
          />
          <SChildrenWrapper>
            <SError>{typeof error === 'string' ? error : ' '}</SError>
            {children}
          </SChildrenWrapper>
        </SContent>
      </SAnimatedContainer>

      <AuthNumberPad
        onPress={onPress}
        onDelete={onDelete}
        biometryType={biometryType}
        onBiometry={onBiometry}
      />
    </SWrapper>
  );
};

const SWrapper = styled.View({
  flex: 1,
});

const SChildrenWrapper = styled.View({
  flex: 1,
  marginTop: 36,
  alignItems: 'center',
});

const SContent = styled.View({
  flex: 1,
  paddingTop: 14,
  paddingBottom: 20,
  paddingHorizontal: 18,
});

const STitle = styled.Text({
  fontSize: 20,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  marginBottom: 15,
  flexShrink: 0,
});

const SSubtitle = styled.Text({
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  paddingHorizontal: 24,
  minHeight: 40, // lineHeight * 2
});

const SError = styled.Text({
  fontSize: 12,
  marginBottom: 12,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.danger,
});

const STitleWrapper = styled.View({
  flex: 1,
  justifyContent: 'flex-end',
  alignItems: 'center',
  marginTop: 34,
  paddingHorizontal: 20,
});

const SAnimatedContainer = Animated.createAnimatedComponent(
  styled.View({
    flex: 1,
  }),
);

export default PinCodeView;
