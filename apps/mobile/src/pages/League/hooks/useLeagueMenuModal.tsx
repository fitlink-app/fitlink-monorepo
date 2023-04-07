import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/core';
import {StackNavigationProp} from '@react-navigation/stack';

import {shareDynamicLink} from '@utils';
import {useLeague, useModal} from '@hooks';
import {RootStackParamList} from '@routes';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';

import {Dialog, DialogButton} from 'components/modal';

type UseLeagueMenuModalProps = {
  isPublic: boolean;
  isOnWaitList: boolean;
  membership: 'none' | 'member' | 'owner';
  isCteLeague: boolean;
  leagueId: string;
  leaveLeague: (id: string) => void;
  leaveWaitList: (id: string) => void;
  userId: string;
};

type NavigationType = StackNavigationProp<RootStackParamList, 'League'>;

export const useLeagueMenuModal = ({
  membership,
  leagueId,
  isPublic,
  isCteLeague,
  leaveLeague,
  isOnWaitList,
  leaveWaitList,
  userId,
}: UseLeagueMenuModalProps) => {
  const navigation = useNavigation<NavigationType>();

  const {openModal, closeModal} = useModal();
  const {data: activeLeague} = useLeague(leagueId, true);

  const withClose = useCallback(
    (callback: () => void, id: string) => () => {
      callback();
      closeModal(id);
    },
    [closeModal],
  );

  const getButtons = (id: string) => {
    const result: DialogButton[] = [];
    if (membership === 'member') {
      result.push({
        text: 'Share League',
        type: 'default',
        onPress: withClose(shareLeague, id),
      });
    }
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
    if (isOnWaitList) {
      result.push({
        text: 'Leave Waiting List',
        type: 'danger',
        onPress: withClose(handleOnLeaveWaitListPressed, id),
      });
    }
    return result;
  };

  const handleOnInvitePressed = () => {
    navigation.navigate('LeagueInviteFriends', {leagueId});
  };

  const handleOnEditPressed = () => {
    if (!activeLeague) {
      return;
    }

    navigation.navigate('LeagueForm', {
      data: {
        id: leagueId,
        dto: {
          name: activeLeague.name,
          description: activeLeague.description,
          duration: activeLeague.duration,
          repeat: activeLeague.repeat,
          sportId: activeLeague.sport.id,
        },
        imageUrl: activeLeague.image.url_640x360,
      },
    });
  };

  const handleOnLeavePressed = () => {
    leaveLeague(leagueId);
  };

  const handleOnLeaveWaitListPressed = () => {
    leaveWaitList(leagueId);
  };

  const handleOnReportCheatingPress = () => {
    navigation.navigate('CheatingReportScreen', {leagueId});
  };

  const shareLeague = async () => {
    try {
      await shareDynamicLink(
        'Think you can beat me?\nProve it, plus get paid in a compete-to-earn league. Join for free; let’s go!',
        {
          link: `https://bfitcoin.com?type=${DeepLinkType.League}&id=${leagueId}&inviter=${userId}`,
        },
      );
    } catch (e) {
      // TODO: snackbar
      console.error(e);
    }
  };

  return () => {
    openModal(id => (
      <Dialog
        title={'League Options'}
        onCloseCallback={() => {
          closeModal(id);
        }}
        buttons={getButtons(id)}
      />
    ));
  };
};
