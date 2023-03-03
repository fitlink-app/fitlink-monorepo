import React, {FC, useState} from 'react';
import {Dimensions, ImageSourcePropType, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/core';
import Animated from 'react-native-reanimated';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';

import {Label} from '@components';
import {
  useJoinLeague,
  useLeagueMembersMe,
  useLeaveLeague,
  useModal,
} from '@hooks';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrors} from '@api';
import {c2eLeagueTypeErrorMsg, c2eLimitReachedErrorMsg} from '@constants';

import {ActionButton} from './ActionButton';
import {useLeagueMenuModal} from '../hooks/useLeagueMenuModal';
import {useLeaderboardCountback} from '../hooks/useLeaderboardCountback';
import AnimatedHeaderCard from '../../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';
import {MaxedOutBanner} from './MaxedOutBanner';
import {OnlyOneTypeBanner} from './OnlyOneTypeBanner';
import {TryTomorrowBanner} from './TryTomorrowBanner';
import {useClaimLeagueBfit} from '../../../hooks/api/leagues/useClaimLeagueBfit';
import {
  convertBfitToUsd,
  getPositiveValueOrZero,
  getViewBfitValue,
} from '@utils';

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
  bFitToClaimRaw?: number;
  bfit?: number;
  isCteLeague?: boolean;
  handleOnEditPressed: () => void;
  sharedContentOffset: Animated.SharedValue<number>;
}

export const AnimatedLeaderboardHeaderCard: FC<IAnimatedLeaderboardHeaderCardProps> =
  ({
    leagueId,
    membership,
    isPublic,
    handleOnEditPressed,
    isCteLeague = false,
    imageSource,
    memberCount,
    bFitToClaimRaw,
    bfit,
    title,
    resetDate,
    repeat,
    description,
    onHeightMeasure: onHeightLayout,
    sharedContentOffset,
  }) => {
    const navigation = useNavigation();

    const [showAltCurrency, setShowAltCurrency] = useState(false);

    const leaderboardLabelText = 'LEADERBOARD';
    const isMember = membership !== 'none';
    const bFitToClaim = getPositiveValueOrZero(
      getViewBfitValue(bFitToClaimRaw),
    );
    const displayBfit = getPositiveValueOrZero(bfit);
    const dailyBfit = showAltCurrency
      ? `$${convertBfitToUsd(displayBfit)}`
      : `${displayBfit} BFIT`;

    const {mutateAsync: joinLeague} = useJoinLeague();
    const {mutateAsync: leaveLeague} = useLeaveLeague();
    const {
      mutateAsync: claimBfit,
      isLoading: isClaiming,
      isSuccess: isClaimed,
    } = useClaimLeagueBfit();

    const {isLoading: isLoadingMembersMe} = useLeagueMembersMe(
      leagueId,
      isMember,
    );

    const {openModal} = useModal();

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

    const handleClaimBfitPressed = async () => {
      const canClaim = bFitToClaimRaw !== undefined && bFitToClaim !== 0;

      if (bFitToClaim === 0) {
        openModal(() => <TryTomorrowBanner />);
      } else if (canClaim && leagueId) {
        await claimBfit({id: leagueId, dto: {amount: bFitToClaimRaw}});
      }
    };

    const swapRewardCurrency = () => {
      setShowAltCurrency(prev => !prev);
    };

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
            animatedValue: isCteLeague ? dailyBfit : undefined,
            onAnimatedValuePress: isCteLeague ? swapRewardCurrency : undefined,
          }}
          descriptionProps={{
            description,
          }}
          onHeightLayout={onHeightLayout}
          sharedContentOffset={sharedContentOffset}>
          <View style={styles.subheader}>
            <Label
              style={{
                fontSize: calculateFontSize(18, leaderboardLabelText.length),
              }}>
              {leaderboardLabelText}
            </Label>
            <ActionButton
              isMember={isMember}
              isCteLeague={isCteLeague}
              handleOnJoinPressed={handleOnJoinPressed}
              handleClaimBfitPressed={handleClaimBfitPressed}
              bfitValue={bFitToClaim}
              isClaiming={isClaiming || isLoadingMembersMe}
              isClaimed={isClaimed}
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
});

// 3 - experimental number to get half-screen label size, may be changed with change of text in it
export function calculateFontSize(paddingSize: number, textSize: number) {
  return (Dimensions.get('window').width - paddingSize * 2) / (textSize + 3);
}

export default AnimatedLeaderboardHeaderCard;
