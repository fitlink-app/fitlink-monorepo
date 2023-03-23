import React, {useContext, useEffect} from 'react';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';
import {useDispatch, useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth';
import {getUrlParams} from 'utils/api';
import {navigationRef} from 'routes/router';
import {Modal, TeamInvitation} from '@components';
import {useMe, useModal} from '@hooks';
import {AppDispatch} from 'redux/store';
import {
  getInvitationData,
  resetTeamInvitation,
  selectTeamInvitation,
} from 'redux/teamInvitation/teamInvitationSlice';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';
import {useDefaultOkSnackbar} from './snackbar';

export const DeeplinkHandler = () => {
  const navigation = navigationRef;
  const {openModal, closeModal} = useModal();
  const showOkSnackbar = useDefaultOkSnackbar();
  const dispatch = useDispatch() as AppDispatch;

  const isAuthenticated = useSelector(memoSelectIsAuthenticated);
  const {invitation, code} = useSelector(selectTeamInvitation);

  const {data: me, refetch: refetchUser} = useMe({enabled: isAuthenticated});

  useEffect(() => {
    dynamicLinks()
      .getInitialLink()
      .then(link => {
        if (link) {
          handleDynamicLink(link.url, 'background');
        }
      });
  }, []);

  useEffect(() => {
    // Create listener
    const unsubscribe = dynamicLinks().onLink(link => {
      handleDynamicLink(link.url, 'foreground');
    });
    return () => unsubscribe();
  }, [isAuthenticated, invitation, code, me, handleDynamicLink]);

  const handleDynamicLink = async (
    url: string,
    source: 'background' | 'foreground',
  ) => {
    const {type} = getUrlParams(url);

    switch (type) {
      case DeepLinkType.TeamInvitation:
        const {code} = getUrlParams(url);
        handleTeamInvitation(code);
        break;

      case DeepLinkType.PasswordReset:
        handlePasswordReset();
        break;

      case DeepLinkType.LeagueInvitation:
        handleLeagueInvitation();
        break;

      case DeepLinkType.EmailVerification:
        handleEmailVerified();
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (invitation && code) {
      showTeamInvitationModal(invitation, code);
    }
  }, [invitation]);

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
    if (!isAuthenticated) {
      return;
    }

    navigation.current?.navigate('Leagues', {
      tab: 2,
    });
  };

  const handleEmailVerified = async () => {
    showOkSnackbar('Your email address has been verified!');
  };

  const showTeamInvitationModal = async (invitation: Team, code: string) => {
    if (!isAuthenticated || !me?.onboarded || !code) {
      return;
    }

    const userQuery = await refetchUser();

    if (
      !userQuery.data ||
      userQuery.data.teams?.find(team => team.id === invitation?.id)
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

  return null;
};
