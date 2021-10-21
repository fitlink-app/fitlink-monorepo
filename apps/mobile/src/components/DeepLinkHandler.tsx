import React, {useEffect, useState} from 'react';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {DeepLinkType} from '@fitlink/api/src/constants/deep-links';
import messaging from '@react-native-firebase/messaging';
import {useSelector} from 'react-redux';
import {memoSelectIsAuthenticated} from 'redux/auth/authSlice';
import {getUrlParams} from 'utils/api';
import {navigationRef} from 'routes/router';
import api from '@api';
import {Team} from '@fitlink/api/src/modules/teams/entities/team.entity';
import {Button, Modal, TeamInvitation} from '@components';
import {useModal} from '@hooks';
import {InteractionManager, View} from 'react-native';

export enum DEEP_LINK_TYPES {
  TeamInvitation = 'team_invitation',
  PasswordReset = 'password_reset',
  ReonboardEmailConfirmation = 'reonboard_email_confirmation',
}

export const DeeplinkHandler = () => {
  const navigation = navigationRef;
  const isAuthenticated = useSelector(memoSelectIsAuthenticated);
  const {openModal, closeModal} = useModal();

  const [areInteractionsDone, setInteractionsDone] = useState(false);

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
    InteractionManager.runAfterInteractions(() => {
      setTimeout(() => {
        setInteractionsDone(true);
      }, 250);
    });
  }, []);

  useEffect(() => {
    if (areInteractionsDone) {
      dynamicLinks()
        .getInitialLink()
        .then(link => {
          if (link) {
            handleDynamicLink(link.url, 'background');
          }
        });
    }
  }, [areInteractionsDone]);

  useEffect(() => {
    // Create listener
    const unsubscribe = dynamicLinks().onLink(link => {
      handleDynamicLink(link.url, 'foreground');
    });
    return () => unsubscribe();
  }, []);

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
    if (isAuthenticated) {
      try {
        const result = await api.get<Team>(`/teams/code/${code}`);

        openModal(id => {
          return (
            <Modal>
              <TeamInvitation
                style={{marginBottom: 40}}
                teamName={result.name}
                avatar={result.avatar?.url_512x512}
              />

              <Button
                text={'Accept Invitation'}
                onPress={() => {
                  closeModal(id);
                }}
              />
              <View style={{height: 10}} />
              <Button
                textOnly
                text={'Not now'}
                onPress={() => {
                  closeModal(id);
                }}
              />
            </Modal>
          );
        });
      } catch (e) {
        console.log(e);
      }
    } else {
      // NO - Store code in state to show team info
    }
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

  return null;
};
