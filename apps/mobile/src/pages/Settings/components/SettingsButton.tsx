import React from 'react';
import styled, {
  DefaultTheme,
  ThemeProps,
  useTheme,
} from 'styled-components/native';
import {ActivityIndicator, View} from 'react-native';

import {Icon, TouchHandler, TouchHandlerProps} from '@components';
import {SettingsItemWrapper} from './SettingsItemWrapper';
import {SettingsItemLabel} from './SettingsItemLabel';

const StyledTouchHandler = styled(TouchHandler).attrs(() => ({
  animationType: 'opacity',
}))({
  paddingVertical: 15,
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type StyledIconParams = {
  icon?: string;
  accent?: boolean;
};

const StyledIcon = styled(Icon).attrs(
  ({icon, accent, theme}: StyledIconParams & ThemeProps<DefaultTheme>) => ({
    name: icon || 'arrow-right',
    size: 16,
    color: accent
      ? theme.colors.accent
      : icon
      ? 'white'
      : theme.colors.accentSecondary,
  }),
)<StyledIconParams>({});

export interface SettingsButtonProps extends TouchHandlerProps {
  /** Display label of this button */
  label: string;

  /** Icon's name if any, will use 'angle-right' if unset */
  icon?: string | 'none';

  /** Called on button press */
  onPress?: () => void;

  /** Should the button use the accent color */
  accent?: boolean;

  /** Optional component rendered before the button label */
  preLabelComponent?: React.ReactNode;

  /** Whether the component should display an activity indicator */
  loading?: boolean;
}

export const SettingsButton = (props: SettingsButtonProps) => {
  const {label, icon, onPress, accent, preLabelComponent, loading, disabled} =
    props;
  const {colors} = useTheme();

  const renderIcon = () => {
    return icon !== 'none' && <StyledIcon {...{icon, accent}} />;
  };

  return (
    <SettingsItemWrapper>
      <StyledTouchHandler {...{onPress}} disabled={loading || disabled}>
        <Row>
          <Row>
            {preLabelComponent}
            <SettingsItemLabel {...{accent}} children={label} />
          </Row>

          {loading ? (
            <View>
              <ActivityIndicator
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: -20,
                  right: 0,
                }}
                size={'small'}
                color={accent ? colors.accent : colors.accentSecondary}
              />
            </View>
          ) : (
            renderIcon()
          )}
        </Row>
      </StyledTouchHandler>
    </SettingsItemWrapper>
  );
};
