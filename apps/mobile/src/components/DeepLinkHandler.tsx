import React, {useEffect, useState} from 'react';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';
import messaging from '@react-native-firebase/messaging';
import {useDispatch, useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth/authSlice';
import {getUrlParams} from 'utils/api';
import {navigationRef} from 'routes/router';
import api from '@api';
import {Button, Modal, TeamInvitation} from '@components';
import {useJoinTeamByCode, useMe, useModal} from '@hooks';
import {AppDispatch} from 'redux/store';
import {
  getInvitationData,
  resetTeamInvitation,
  selectTeamInvitation,
} from 'redux/teamInvitation/teamInvitationSlice';
import {View} from 'react-native';

export enum DEEP_LINK_TYPES {
  TeamInvitation = 'team_invitation',
  PasswordReset = 'password_reset',
  ReonboardEmailConfirmation = 'reonboard_email_confirmation',
}

export const DeeplinkHandler = () => {
  const navigation = navigationRef;
  const {openModal, closeModal} = useModal();
  const dispatch = useDispatch() as AppDispatch;

  const isAuthenticated = useSelector(memoSelectIsAuthenticated);
  const {invitation, code} = useSelector(selectTeamInvitation);

  const {data: me, refetch: refetchUser} = useMe({enabled: isAuthenticated});

  //   useEffect(() => {
  //     messaging().onNotificationOpenedApp(remoteMessage => {
  //       if (remoteMessage?.data) handlePushNotification(remoteMessage.data);
  //     });

  //     messaging()
  //       .getInitialNotification()
  //       .then(remoteMessage => {
  //         if (remoteMessage?.data) handlePushNotification(remoteMessage.data);
  //       });
  //   }, []);

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
  }, [isAuthenticated, invitation, code, me, openModal]);

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

      // TODO:
      //   case DeepLinkType.PasswordReset:
      //     handlePasswordReset();
      //     break;

      //   case DeepLinkType.ReonboardEmailConfirmation:
      //     const { email, token } = getUrlParams(url);
      //     handleReonboardEmailConfirmation(email, token);
      //     break;

      default:
        break;
    }
  };

  //   const handlePushNotification = async (data: {[key: string]: string}) => {
  //     if (!data.type) return;

  //     switch (data.type) {
  //       case 'reward':
  //         handleRewardOpen(data.id);
  //         break;

  //       case 'league':
  //         handleLeagueOpen(data.id);
  //         break;

  //       case 'profile':
  //         handleProfileOpen(data.id);

  //       default:
  //         break;
  //     }
  //   };

  const handleTeamInvitation = async (code: string) => {
    try {
      await dispatch(getInvitationData(code));
    } catch (e) {
      console.log('Failed to get team invitation data');
    }

    showTeamInvitationModal();
  };

  //   const handlePasswordReset = async () => {
  //     openModal(
  //       <SimpleDialog
  //         title={'Password Reset'}
  //         text={'Your password has been reset successfully!'}
  //       />,
  //     );
  //   };

  //   const handleReonboardEmailConfirmation = (email: string, token: string) => {
  //     navigationRef.current?.dispatch(
  //       StackActions.push('ReonboardingNewPassword', {email, token}),
  //     );
  //   };

  //   const handleRewardOpen = async (rewardId: string) => {
  //     if (!isAuthenticated) return;

  //     navigationRef.current?.navigate('Reward', {rewardId});
  //   };

  //   const handleLeagueOpen = async (leagueId: string) => {
  //     if (!isAuthenticated) return;

  //     navigationRef.current?.dispatch(
  //       StackActions.push('League', {
  //         league: undefined,
  //         leagueId: leagueId,
  //       }),
  //     );
  //   };

  //   const handleProfileOpen = async (userId: string) => {
  //     if (!isAuthenticated) return;

  //     navigationRef.current?.dispatch(StackActions.push('Profile', {id: userId}));
  //   };

  const showTeamInvitationModal = async () => {
    if (!invitation || !isAuthenticated || !me?.onboarded || !code) return;

    const userQuery = await refetchUser();

    if (
      !userQuery.data ||
      userQuery.data.teams?.find(team => team.id === invitation?.id)
    ) {
      console.log('User already member of team.');
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
                  dispatch(resetTeamInvitation());

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
        () => {
          dispatch(resetTeamInvitation());
        },
        'teamInvitationModal',
      );
    }, 500);
  };

  return null;
};
