import React, {FC} from 'react';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {
  ImageSourcePropType,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';

import {
  useJoinLeague,
  useLeagueMembersMe,
  useLeaveLeague,
  useModal,
  useClaimLeagueBfit,
  useOnWaitList,
  useLeaveWaitList,
} from '@hooks';
import {ResponseError} from '@fitlink/api-sdk/types';
import {getErrors} from '@api';
import {c2eLeagueTypeErrorMsg, c2eLimitReachedErrorMsg} from '@constants';
import {getPositiveValueOrZero, getViewBfitValue} from '@utils';
import {SortDescIcon} from '@components';
import theme from '@theme';

import {LeagueAnimatedHeaderCard} from 'components/common/LeagueAnimatedHeaderCard';
import {useDefaultOkSnackbar} from '../../../components/snackbar';
import {useLeaderboardCountback} from '../hooks/useLeaderboardCountback';
import {useLeagueMenuModal} from '../hooks/useLeagueMenuModal';
import {ActionButton} from './ActionButton';
import {MaxedOutBanner} from './MaxedOutBanner';
import {OnlyOneTypeBanner} from './OnlyOneTypeBanner';
import {TryTomorrowBanner} from './TryTomorrowBanner';

interface IAnimatedLeaderboardHeaderCardProps {
  imageSource: ImageSourcePropType;
  memberCount: number;
  title: string;
  resetDate: Date;
  startDate: Date;
  description: string;
  onHeightMeasure?: (height: number) => void;
  membership: 'none' | 'member' | 'owner';
  leagueId: string;
  isPublic: boolean;
  bFitToClaimRaw?: number;
  dailyBfit?: number;
  distributedTodayBfit?: number;
  isCteLeague?: boolean;
  bfitTotal?: number;
  userId: string;
  sharedContentOffset: Animated.SharedValue<number>;
  onFilterMembersPress: () => void;
}

export const AnimatedLeaderboardHeaderCard: FC<
  IAnimatedLeaderboardHeaderCardProps
> = ({
  leagueId,
  membership,
  isPublic,
  isCteLeague = false,
  imageSource,
  memberCount,
  bFitToClaimRaw,
  title,
  startDate,
  resetDate,
  description,
  onHeightMeasure: onHeightLayout,
  sharedContentOffset,
  userId,
  bfitTotal,
  onFilterMembersPress,
}) => {
  const leaderboardLabelText = 'LEADERBOARD';
  const isMember = membership !== 'none';
  const bFitToClaim = getPositiveValueOrZero(getViewBfitValue(bFitToClaimRaw));

  const {mutateAsync: joinLeague, isLoading: isJoining} = useJoinLeague();
  const {mutateAsync: leaveLeague} = useLeaveLeague();
  const {mutateAsync: claimBfit, isLoading: isClaiming} = useClaimLeagueBfit();
  const {mutateAsync: leaveWaitList} = useLeaveWaitList();

  const enqueueOkSnackbar = useDefaultOkSnackbar();

  useLeagueMembersMe(leagueId, isMember);

  const {openModal} = useModal();

  const {data: isOnWaitList, isLoading: isLoadingOnWaitList} =
    useOnWaitList(leagueId);

  const handleOnMenuPressed = useLeagueMenuModal({
    membership,
    isPublic,
    isCteLeague,
    leagueId,
    leaveLeague,
    leaveWaitList,
    isOnWaitList: isOnWaitList?.waitlist ?? false,
    userId,
  });

  const countback = useLeaderboardCountback({
    resetDate: new Date(resetDate),
    startDate: new Date(startDate),
  });

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
        enqueueOkSnackbar(errorMessage);
      }
    }
  };

  const handleClaimBfitPressed = async () => {
    const canClaim = bFitToClaimRaw !== undefined && bFitToClaim !== 0;

    if (bFitToClaim === 0) {
      openModal(() => <TryTomorrowBanner />);
    } else if (canClaim && leagueId) {
      await claimBfit({id: leagueId, dto: {amount: bFitToClaimRaw}});
    }
  };

    return (
      <BottomSheetModalProvider>
        <LeagueAnimatedHeaderCard
          headerProps={{
            title: 'LEAGUE',
            onNavbarRightPress: handleOnMenuPressed,
            isNavbarRightVisible: true,
          }}
          imageContainerProps={{
            imageSource,
            members: memberCount,
            title,
            countback: isCteLeague ? countback : undefined,
          }}
          descriptionProps={{
            description,
          }}
          onHeightLayout={onHeightLayout}
          sharedContentOffset={sharedContentOffset}
        >
          <View style={styles.subheader}>
            <View style={{flexDirection: 'row'}}>
              <SHeaderTitle>{leaderboardLabelText}</SHeaderTitle>
              <TouchableOpacity onPress={onFilterMembersPress}>
                <SortDescIcon color={theme.colors.accent} />
              </TouchableOpacity>
            </View>
            <ActionButton
              isMember={isMember}
              isCteLeague={isCteLeague}
              handleOnJoinPressed={handleOnJoinPressed}
              handleClaimBfitPressed={handleClaimBfitPressed}
              bfitValue={bFitToClaim}
              isJoining={isJoining}
              isClaiming={isClaiming}
              isLoadingOnWaitList={isLoadingOnWaitList}
              bfitTotal={bfitTotal}
              isExpired={new Date(resetDate).getTime() - Date.now() <= 0}
            />
          </View>
        </LeagueAnimatedHeaderCard>
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

const SHeaderTitle = styled.Text({
  fontSize: 20,
  lineHeight: 24,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  textTransform: 'uppercase',
  marginRight: 8,
});

export default AnimatedLeaderboardHeaderCard;
