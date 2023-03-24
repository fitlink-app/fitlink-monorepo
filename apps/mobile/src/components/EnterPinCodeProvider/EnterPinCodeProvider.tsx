import React, {FC} from 'react';
import {Modal} from 'react-native';
import styled from 'styled-components/native';

import {useRevokeAccessOnIdle} from '@hooks';
import {AuthPromiseProvider} from '@model';
import {PinCodeWrapper} from '@components';

import {
  grantClientSideAccess,
  resetPinErrorCount,
  selectClientSideAccessGrantedAt,
  selectIsClientSideAccessGranted,
} from '../../redux/auth';
import {useAppDispatch, useAppSelector} from '../../redux/store';
import themes from '../../theme/themes';

export const EnterPinCodeProvider: FC = ({children}) => {
  const dispatch = useAppDispatch();
  const isClientSideAccessGranted = useAppSelector(
    selectIsClientSideAccessGranted,
  );
  const hasPinCode = useAppSelector(selectClientSideAccessGrantedAt)!!;

  useRevokeAccessOnIdle();

  const completeClientAuth = () => {
    dispatch(grantClientSideAccess());
    dispatch(resetPinErrorCount());
    AuthPromiseProvider.getInstance().resolve();
  };

  return (
    <>
      {hasPinCode && (
        <Modal visible={!isClientSideAccessGranted} animationType="slide">
          <SWrapper>
            <PinCodeWrapper
              useBiometry
              forceBiometry
              title="Enter pin code"
              onSuccess={completeClientAuth}
            />
          </SWrapper>
        </Modal>
      )}
      <React.Fragment key="enter-pin-code-children">{children}</React.Fragment>
    </>
  );
};

const SWrapper = styled.SafeAreaView({
  flex: 1,
  paddingHorizontal: 18,
  backgroundColor: themes.colors.background,
});

export default EnterPinCodeProvider;
