import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {navigationRef} from '@routes';
import {useMe, useModal, useWasIdle} from '@hooks';
import {Modal, TeamInvitation} from '@components';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';

import {useAppDispatch, useAppStore} from '../../../redux/store';
import {selectIsAuthenticated} from '../../../redux/auth';
import {
  getInvitationData,
  resetTeamInvitation,
  selectTeamInvitation,
} from '../../../redux/teamInvitation/teamInvitationSlice';
import {useAuthResolvers} from '../../../contexts';
import {getUrlParams} from '../../../utils/api';

export const useDynamicLinksHandler = () => {
  const navigation = navigationRef;
  const {openModal, closeModal} = useModal();
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const {invitation, code} = useSelector(selectTeamInvitation);

  const {data: me, refetch: refetchUser} = useMe({enabled: isAuthenticated});

  const {wasIdle} = useWasIdle();
  const {enqueueAuthResolver} = useAuthResolvers();

  const handleDynamicLink = async (url: string) => {
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
        withAbleToHandle(handleLeagueInvitation)();
        break;

      case DeepLinkType.EmailVerification:
        handleEmailVerified();
        break;

      case DeepLinkType.League:
        if (wasIdle()) {
          enqueueAuthResolver(() => handleLeagueDeepLink(params.id));
        } else {
          withAbleToHandle(handleLeagueDeepLink)(params.id);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (invitation && code) {
      withAbleToHandle(showTeamInvitationModal)(invitation, code);
    }
  }, [invitation, code]);

  const withAbleToHandle =
    (handler: (...args: any[]) => void) =>
    (...args: any[]) => {
      const isAuth = selectIsAuthenticated(store.getState());
      if (!isAuth || !me?.onboarded) {
        return;
      }
      handler(...args);
    };

  const handleLeagueDeepLink = (id?: string) => {
    if (id !== undefined) {
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
    openModal(id => (
      <Modal
        title={'Password Reset'}
        description={'Your password has been reset successfully!'}
        buttons={[
          {
            text: 'Ok',
            onPress: () => closeModal(id),
          },
        ]}
      />
    ));
  };

  const handleLeagueInvitation = () => {
    navigation.current?.navigate('Leagues', {
      tab: 2,
    });
  };

  const handleEmailVerified = async () => {
    openModal(id => (
      <Modal
        title={'Email Verified'}
        description={'Your email address has been verified!'}
        buttons={[
          {
            text: 'Ok',
            onPress: () => closeModal(id),
          },
        ]}
      />
    ));
  };

  const showTeamInvitationModal = async (invitation: Team, code: string) => {
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
                      openModal(id => {
                        return (
                          <Modal
                            title={'Joined Team'}
                            description={`You have joined ${invitation.name}`}
                            buttons={[
                              {
                                text: 'Ok',
                                onPress: () => closeModal(id),
                              },
                            ]}
                          />
                        );
                      });
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
