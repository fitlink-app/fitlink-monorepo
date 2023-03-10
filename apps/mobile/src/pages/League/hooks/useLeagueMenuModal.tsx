import {useModal} from '@hooks';
import {Dialog, DialogButton} from 'components/modal';
import React, {useCallback} from 'react';

type UseLeagueMenuModalProps = {
  isPublic: boolean;
  membership: 'none' | 'member' | 'owner';
  isCteLeague: boolean;
  handleOnInvitePressed: () => void;
  handleOnLeavePressed: () => void;
  handleOnEditPressed: () => void;
  handleOnReportCheatingPress: () => void;
};

export const useLeagueMenuModal = ({
  membership,
  isPublic,
  handleOnInvitePressed,
  handleOnLeavePressed,
  handleOnEditPressed,
  isCteLeague,
  handleOnReportCheatingPress,
}: UseLeagueMenuModalProps) => {
  const {openModal, closeModal} = useModal();

  const withClose = useCallback(
    (callback: () => void, id: string) => () => {
      callback();
      closeModal(id);
    },
    [closeModal],
  );

  const getButtons = useCallback(
    (id: string) => {
      const result: DialogButton[] = [];
      if (membership === 'owner') {
        result.push({
          text: 'Edit League',
          type: 'default',
          onPress: withClose(handleOnEditPressed, id),
        });
      }
      if (isPublic && (membership === 'owner' || membership === 'member')) {
        result.push({
          text: 'Invite Friend',
          type: 'default',
          onPress: withClose(handleOnInvitePressed, id),
        });
      }
      if (isCteLeague && membership === 'member') {
        result.push({
          text: 'Report Cheating',
          type: 'danger',
          onPress: withClose(handleOnReportCheatingPress, id),
        });
      }
      if (membership === 'member') {
        result.push({
          text: 'Leave League',
          type: 'danger',
          onPress: withClose(handleOnLeavePressed, id),
        });
      }
      return result;
    },
    [
      isCteLeague,
      handleOnReportCheatingPress,
      handleOnEditPressed,
      handleOnInvitePressed,
      handleOnLeavePressed,
      isPublic,
      membership,
      withClose,
    ],
  );

  return useCallback(() => {
    openModal(id => (
      <Dialog
        title={'League Options'}
        onCloseCallback={() => {
          closeModal(id);
        }}
        buttons={getButtons(id)}
      />
    ));
  }, [getButtons, closeModal, openModal]);
};
