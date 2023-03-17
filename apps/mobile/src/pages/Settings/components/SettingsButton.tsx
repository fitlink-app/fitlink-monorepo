import React, {FC} from 'react';
import styled, {
  DefaultTheme,
  ThemeProps,
  useTheme,
} from 'styled-components/native';
import {StyleSheet} from 'react-native';

import {Icon, TouchHandler, TouchHandlerProps, BfitSpinner} from '@components';

import {SettingsItemWrapper} from './SettingsItemWrapper';
import {SettingsItemLabel} from './SettingsItemLabel';

const StyledTouchHandler = styled(TouchHandler).attrs(() => ({
  animationType: 'opacity',
}))({
  paddingVertical: 15,
  borderColor: '#2e2e2e',
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
    color: accent ? theme.colors.accent : 'white',
  }),
)<StyledIconParams>({});

export interface SettingsButtonProps extends TouchHandlerProps {
  label: string;
  icon?: string | 'none';
  onPress?: () => void;
  accent?: boolean;
  preLabelComponent?: React.ReactNode;
  loading?: boolean;
  profileRow?: boolean;
  renderEndAdornment?: () => JSX.Element;
}

export const SettingsButton: FC<SettingsButtonProps> = ({
  label,
  icon,
  onPress,
  accent,
  preLabelComponent,
  loading,
  profileRow,
  disabled,
  renderEndAdornment,
}) => {
  const {colors} = useTheme();

  const EndAdornment = () => {
    if (loading) {
      return (
        <BfitSpinner
          size="small"
          wrapperStyle={styles.settingsItemWrapper}
          color={accent ? colors.accent : colors.accentSecondary}
        />
      );
    }

    if (renderEndAdornment) {
      return renderEndAdornment();
    }

    return icon !== 'none' ? <StyledIcon {...{icon, accent}} /> : null;
  };

  return (
    <SettingsItemWrapper>
      <StyledTouchHandler
        {...{onPress}}
        style={{borderTopWidth: profileRow ? 0 : 1}}
        disabled={loading || disabled}
      >
        <Row>
          <Row>
            {preLabelComponent}
            <SettingsItemLabel {...{accent}} children={label} />
          </Row>
          <EndAdornment />
        </Row>
      </StyledTouchHandler>
    </SettingsItemWrapper>
  );
};

const styles = StyleSheet.create({
  settingsItemWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -20,
    right: 0,
  },
});
