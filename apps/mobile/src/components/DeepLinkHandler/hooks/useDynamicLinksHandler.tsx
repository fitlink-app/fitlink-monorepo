import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {navigationRef} from '@routes';
import {useMe, useModal} from '@hooks';
import {AuthPromiseProvider} from '@model';
import {Modal, TeamInvitation} from '@components';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';

import {useAppDispatch} from '../../../redux/store';
import {selectIsAuthenticated} from '../../../redux/auth';
import {
  getInvitationData,
  resetTeamInvitation,
  selectTeamInvitation,
} from '../../../redux/teamInvitation/teamInvitationSlice';
import {getUrlParams} from '../../../utils/api';
import {useDefaultOkSnackbar} from '../../snackbar';
import {AnalyticsService} from 'services/analytics';

export const useDynamicLinksHandler = () => {
  const navigation = navigationRef;
  const {openModal, closeModal} = useModal();
  const dispatch = useAppDispatch();
  const showOkSnackbar = useDefaultOkSnackbar();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const {invitation, code} = useSelector(selectTeamInvitation);

  const {refetch: refetchUser} = useMe();

  const handleDynamicLink = async (url: string, isOboarded: boolean) => {
    const params = getUrlParams(url);

    switch (params.type) {
      case DeepLinkType.TeamInvitation:
        const {code} = getUrlParams(url);
        handleTeamInvitation(code);
        break;

      case DeepLinkType.PasswordReset:
        handlePasswordReset();
        break;

      case DeepLinkType.LeagueInvitation:
        if (isAuthenticated && isOboarded) {
          handleLeagueInvitation();
        }
        break;

      case DeepLinkType.EmailVerification:
        handleEmailVerified();
        break;

      case DeepLinkType.League:
        if (isAuthenticated && isOboarded) {
          await AuthPromiseProvider.getInstance().get();
        }
        handleLeagueDeepLink(params.id, params.inviter);
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (invitation && code) {
      showTeamInvitationModal(invitation, code);
    }
  }, [invitation, code]);

  const handleLeagueDeepLink = (id?: string, inviterUserId?: string) => {
    if (id !== undefined) {
      AnalyticsService.sendInviteDeeplinkEvent({leagueId: id, inviterUserId});
      return navigation.current?.reset({
        index: 0,
        routes: [
          {
            name: 'HomeNavigator',
            state: {
              routes: [{name: 'Leagues', params: {tab: 1}}],
            },
          },
          {name: 'League', params: {id}},
        ],
      });
    }

    navigation.current?.reset({
      index: 0,
      routes: [
        {
          name: 'HomeNavigator',
          state: {
            routes: [{name: 'Leagues', params: {tab: 1}}],
          },
        },
      ],
    });
  };

  const handleTeamInvitation = async (code: string) => {
    try {
      await dispatch(getInvitationData(code));
    } catch (e) {
      console.error('Failed to get team invitation data', e);
    }
  };

  const handlePasswordReset = async () => {
    showOkSnackbar('Your password has been reset successfully!');
  };

  const handleLeagueInvitation = () => {
    navigation.current?.navigate('Leagues', {
      tab: 2,
    });
  };

  const handleEmailVerified = async () => {
    showOkSnackbar('Your email address has been verified!');
  };

  const showTeamInvitationModal = async (invitation: Team, code: string) => {
    const {data: me} = await refetchUser();

    if (
      !me?.onboarded ||
      !isAuthenticated ||
      me?.teams?.find(team => team.id === invitation?.id)
    ) {
      console.warn('User already member of team.');
      return;
    }

    setTimeout(() => {
      openModal(
        id => {
          return (
            <Modal containerStyle={{marginVertical: 30}}>
              <TeamInvitation
                teamName={invitation.name}
                avatar={invitation.avatar?.url_512x512}
                code={code}
                showButtons={true}
                onClose={(success: boolean) => {
                  closeModal(id);

                  if (success) {
                    setTimeout(() => {
                      showOkSnackbar(`You have joined ${invitation.name}`);
                    }, 250);
                  }
                }}
              />
            </Modal>
          );
        },
        undefined,
        'teamInvitationModal',
      );

      dispatch(resetTeamInvitation());
    }, 500);
  };

  return {handleDynamicLink};
};
