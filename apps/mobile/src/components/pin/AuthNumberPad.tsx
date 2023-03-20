import React, {FC} from 'react';
import styled from 'styled-components/native';
import {BIOMETRY_TYPE} from 'react-native-keychain';

import KeyboardKey from './KeyboardKey';
import {FaceIdIcon, FingerPrintIcon, BackspaceIcon} from '../icons';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

type BiometryVariantsType = (BIOMETRY_TYPE | null)[];

const FACE_BIOMETRY: BiometryVariantsType = [
  BIOMETRY_TYPE.FACE,
  BIOMETRY_TYPE.FACE_ID,
];

const TOUCH_BIOMETRY: BiometryVariantsType = [
  BIOMETRY_TYPE.TOUCH_ID,
  BIOMETRY_TYPE.FINGERPRINT,
];

export interface IAuthNumberPadProps {
  onDelete(): void;
  onPress(value: string): void;
  biometryType?: BIOMETRY_TYPE | null;
  onBiometry?(): void;
}

export const AuthNumberPad: FC<IAuthNumberPadProps> = ({
  onPress,
  onDelete,
  biometryType = null,
  onBiometry,
}) => {
  const hasFaceId = FACE_BIOMETRY.includes(biometryType);
  const hasTouchId = !hasFaceId && TOUCH_BIOMETRY.includes(biometryType);
  const BiometryIcon = hasFaceId
    ? FaceIdIcon
    : hasTouchId
    ? FingerPrintIcon
    : null;

  return (
    <SWrapper>
      {keys.map(key => (
        <KeyboardKey key={key} onPress={() => onPress(key)} text={key} />
      ))}
      <SBottomRowWrapper>
        {!!biometryType && (
          <KeyboardKey onPress={onBiometry} Icon={BiometryIcon} />
        )}
        <KeyboardKey onPress={() => onPress('0')} text="0" />
        <KeyboardKey onPress={onDelete} Icon={<BackspaceIcon />} />
      </SBottomRowWrapper>
    </SWrapper>
  );
};

const SWrapper = styled.View({
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  marginHorizontal: 10,
});

const SBottomRowWrapper = styled.View({
  width: '100%',
  flexDirection: 'row',
  justifyContent: 'flex-end',
});

export default AuthNumberPad;
