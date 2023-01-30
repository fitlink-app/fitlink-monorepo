import React, {FC} from 'react';
import {Label} from '@components';
import {ActionButton} from './ActionButton';
import {ImageSourcePropType, StyleSheet, View} from 'react-native';
import {useLeagueMenuModal} from '../hooks/useLeagueMenuModal';
import {useNavigation} from '@react-navigation/core';
import {useJoinLeague, useLeaveLeague} from '@hooks';
import {useLeaderboardCountback} from '../hooks/useLeaderboardCountback';
import AnimatedHeaderCard from '../../../components/common/AnimatedHeaderCard/AnimatedHeaderCard';
import Animated from 'react-native-reanimated';

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

const AnimatedLeaderboardHeaderCard: FC<IAnimatedLeaderboardHeaderCardProps> =
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

    const isMember = membership !== 'none';

    const {mutateAsync: joinLeague} = useJoinLeague();
    const {mutateAsync: leaveLeague} = useLeaveLeague();

    const handleOnInvitePressed = () => {
      navigation.navigate('LeagueInviteFriends', {leagueId});
    };

    const handleOnJoinPressed = () => {
      joinLeague(leagueId);
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
