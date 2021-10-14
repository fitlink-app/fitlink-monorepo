import {Icon, Label, Logo, TouchHandler} from '@components';
import React from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import styled from 'styled-components/native';

const Wrapper = styled.View({
  alignItems: 'center',
});

const BackButtonContainer = styled.View({
  position: 'absolute',
  height: '100%',
  left: 0,
  justifyContent: 'center',
});

const LogoutButtonContainer = styled.View({
  position: 'absolute',
  height: '100%',
  right: 0,
  justifyContent: 'center',
});

const BackButton = styled(Icon).attrs(({theme: {colors}}) => ({
  name: 'arrow-left',
  accent: true,
  size: 22,
  color: colors.accent,
}))({
  marginLeft: '20%',
});

interface OnboardNavProps {
  backEnabled?: boolean;
  onBack?: () => void;
  onLogout?: () => void;
}

export const Navigation = ({
  backEnabled = true,
  onBack,
  onLogout,
}: OnboardNavProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Wrapper style={{marginTop: insets.top + 15}}>
      <Logo />
      {backEnabled && (
        <BackButtonContainer>
          <BackButton onPress={onBack} />
        </BackButtonContainer>
      )}
      {onLogout && (
        <LogoutButtonContainer>
          <View style={{marginRight: '20%'}}>
            <TouchHandler
              style={{alignSelf: 'flex-end'}}
              onPress={onLogout}
              hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
              <Label bold type={'caption'} appearance={'accent'}>
                Logout
              </Label>
            </TouchHandler>
          </View>
        </LogoutButtonContainer>
      )}
    </Wrapper>
  );
};
