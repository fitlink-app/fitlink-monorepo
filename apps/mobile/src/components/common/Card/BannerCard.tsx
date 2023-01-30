import React, {FC} from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import styled from 'styled-components/native';

import theme from '../../../theme/themes/fitlink';
import {Icon} from '../Icon';

export interface IBannerCardProps {
  title: string;
  p1: string;
  p2?: string;
  isOpen: boolean;
  onClose: () => void;
  style?: StyleProp<ViewStyle>;
}

export const BannerCard: FC<IBannerCardProps> = ({
  title,
  p1,
  p2,
  isOpen,
  onClose,
  style,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <SCard style={style}>
      <SHeaderRow>
        <SHeaderTitle>{title}</SHeaderTitle>
        <Icon
          size={24}
          onPress={onClose}
          style={styles.icon}
          name="close-outlined"
          color={theme.colors.text}
        />
      </SHeaderRow>
      <STextRow>
        <SText>{p1}</SText>
        {!!p2 && <SText style={{marginTop: 20}}>{p2}</SText>}
      </STextRow>
    </SCard>
  );
};

const SCard = styled.View({
  flex: 1,
  borderRadius: 20,
  backgroundColor: 'rgba(0, 233, 215, 0.3)',
});

const SHeaderRow = styled.View({
  flex: 1,
  borderBottomWidth: 1,
  paddingVertical: 20,
  flexDirection: 'row',
  paddingHorizontal: 26,
  justifyContent: 'space-between',
  borderBottomColor: 'rgba(255, 255, 255, 0.3)',
});

const SHeaderTitle = styled.Text({
  fontSize: 12,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  textTransform: 'uppercase',
});

const STextRow = styled.View({
  flex: 1,
  paddingVertical: 20,
  paddingHorizontal: 26,
});

const SText = styled.Text({
  fontSize: 14,
  fontWeight: 400,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    right: 20,
    top: 14,
  },
});
