import React, {FC} from 'react';
import {ImageSourcePropType, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import Animated from 'react-native-reanimated';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {Label} from '@components';
import {useJoinLeague, useLeaveLeague, useModal} from '@hooks';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrors} from '@api';
import {c2eLeagueTypeErrorMsg, c2eLimitReachedErrorMsg} from '@constants';

import {ActionButton} from './ActionButton';
import {useLeagueMenuModal} from '../hooks/useLeagueMenuModal';
import {useLeaderboardCountback} from '../hooks/useLeaderboardCountback';
import AnimatedHeaderCard from '../../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';
import {MaxedOutBanner} from './MaxedOutBanner';
import {OnlyOneTypeBanner} from './OnlyOneTypeBanner';

interface IAnimatedLeaderboardHeaderCardProps {
  imageSource: ImageSourcePropType;
  memberCount: number;
  title: string;
  resetDate: Date;
  repeat: boolean;
  description: string;
  onHeightMeasure?: (height: number) => void;
  membership: 'none' | 'member' | 'owner';
  leagueId: string;
  isPublic: boolean;
  bFitToClaim?: number;
  bfit?: number;
  isCteLeague?: boolean;
  handleOnEditPressed: () => void;
  onClaimPressed?: () => void;
  sharedContentOffset: Animated.SharedValue<number>;
}

export const AnimatedLeaderboardHeaderCard: FC<IAnimatedLeaderboardHeaderCardProps> =
  ({
    leagueId,
    membership,
    isPublic,
    handleOnEditPressed,
    onClaimPressed,
    isCteLeague = false,
    imageSource,
    memberCount,
    bFitToClaim,
    bfit,
    title,
    resetDate,
    repeat,
    description,
    onHeightMeasure: onHeightLayout,
    sharedContentOffset,
  }) => {
    const navigation = useNavigation();

    const {mutateAsync: joinLeague} = useJoinLeague();
    const {mutateAsync: leaveLeague} = useLeaveLeague();
    const {openModal} = useModal();

    const isMember = membership !== 'none';

    const handleOnInvitePressed = () => {
      navigation.navigate('LeagueInviteFriends', {leagueId});
    };

    const openMaxedOutModal = () => {
      openModal(() => <MaxedOutBanner />);
    };

    const handleOnJoinPressed = async () => {
      try {
        await joinLeague(leagueId);
      } catch (e) {
        const resError = e as ResponseError;
        const errorMessage = getErrors(resError).message;
        if (errorMessage === c2eLimitReachedErrorMsg) {
          openMaxedOutModal();
        } else if (errorMessage === c2eLeagueTypeErrorMsg) {
          openModal(() => <OnlyOneTypeBanner errorMessage={errorMessage} />);
        } else {
          console.error('handleOnJoinPressed', errorMessage);
        }
      }
    };

    const handleOnLeavePressed = () => {
      leaveLeague(leagueId);
    };

    const handleOnMenuPressed = useLeagueMenuModal({
      membership,
      isPublic,
      handleOnInvitePressed,
      handleOnLeavePressed,
      handleOnEditPressed,
    });

    const countback = useLeaderboardCountback({
      date: resetDate,
      repeat,
    });

    return (
      <BottomSheetModalProvider>
        <AnimatedHeaderCard
          headerProps={{
            title: 'LEAGUE',
            onNavbarRightPress: handleOnMenuPressed,
            isNavbarRightVisible: true,
          }}
          imageContainerProps={{
            imageSource,
            p1: `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`,
            p2: title,
            p3: countback,
            animatedValue: isCteLeague ? `${bfit} BFIT` : undefined,
          }}
          descriptionProps={{
            description,
          }}
          onHeightLayout={onHeightLayout}
          sharedContentOffset={sharedContentOffset}>
          <View style={styles.subheader}>
            <Label style={styles.subheaderLabel}>LEADERBOARD</Label>
            <ActionButton
              isMember={isMember}
              isCteLeague={isCteLeague}
              handleOnJoinPressed={handleOnJoinPressed}
              handleClaimBfitPressed={onClaimPressed}
              bfitValue={bFitToClaim}
            />
          </View>
        </AnimatedHeaderCard>
      </BottomSheetModalProvider>
    );
  };

const styles = StyleSheet.create({
  subheader: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingRight: 18,
    paddingLeft: 18,
    marginTop: 20,
    marginBottom: 20,
  },
  subheaderLabel: {
    fontSize: 19,
  },
});

export default AnimatedLeaderboardHeaderCard;
