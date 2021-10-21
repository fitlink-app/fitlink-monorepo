import {UserCounter} from 'components/common/UserCounter';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Image} from 'react-native';
import {
  Avatar,
  Chip,
  Icon,
  Label,
  ProgressCircle,
  TouchHandler,
} from '../common';
import {FeedCollage} from './FeedCollage';
import {FeedStatLabel} from './FeedStatLabel';
import {formatRelative, formatDistanceStrict} from 'date-fns';
import locale from 'date-fns/locale/en-US';
import {useNavigation} from '@react-navigation/native';
import {FeedItem as FeedItemClass} from '@fitlink/api/src/modules/feed-items/entities/feed-item.entity';
import {UnitSystem} from '@fitlink/api/src/modules/users/users.constants';
import {
  formatDistanceShortLocale,
  getActivityDistance,
  getSpeedValue,
} from '@utils';
import {useLike, useDislike, useMe} from '@hooks';
import {
  FeedGoalType,
  FeedItemType,
} from '@fitlink/api/src/modules/feed-items/feed-items.constants';

const Wrapper = styled.View(({theme}) => ({
  paddingVertical: 15,
  marginHorizontal: 20,
  borderColor: theme.colors.separator,
}));

const RightContainer = styled.View({
  marginLeft: 14,
  flex: 1,
});

const Row = styled.View({flexDirection: 'row'});

const Col = styled.View({});

const IconContainer = styled.View(({theme: {colors}}) => ({
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 1337,
  height: 52,
  width: 52,
  backgroundColor: colors.surface,
}));

const SpacedRow = styled(Row)({
  paddingBottom: 8,
  alignItems: 'flex-start',
  justifyContent: 'space-between',
});

const DateText = styled(Label)({paddingTop: 5});

const ButtonContainer = styled.View(({theme: {colors}}) => ({
  flexDirection: 'row',
  height: 32,
  backgroundColor: colors.surface,
  borderRadius: 16,
  alignItems: 'center',
}));

const Button = styled(TouchHandler)({
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});

const ButtonSeparator = styled.View(({theme: {colors}}) => ({
  width: 1,
  height: 20,
  backgroundColor: colors.background,
}));

interface FeedItemProps {
  item: FeedItemClass;
  unitSystem: UnitSystem;
  isLiked: boolean;
}

export const _FeedItem = ({item, unitSystem, isLiked}: FeedItemProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const {data: me} = useMe({enabled: false});

  const {mutateAsync: like} = useLike();

  const {mutateAsync: dislike} = useDislike();

  const distance = item.health_activity?.distance
    ? (getActivityDistance(unitSystem, item.health_activity?.distance, {
        short: true,
      }) as string)
    : undefined;

  const duration = item.health_activity
    ? formatDistanceStrict(
        new Date(item.health_activity.start_time),
        new Date(item.health_activity.end_time),
        {
          locale: {
            ...locale,
            formatDistance: formatDistanceShortLocale,
          },
        },
      )
    : undefined;

  const durationInSeconds = item.health_activity
    ? (new Date(item.health_activity.start_time).valueOf() -
        new Date(item.health_activity.end_time).valueOf()) /
      1000
    : undefined;

  const speed =
    item.health_activity?.distance && durationInSeconds
      ? (getSpeedValue(
          item.health_activity.sport?.name_key,
          item.health_activity.distance,
          durationInSeconds,
          unitSystem,
        ) as string)
      : undefined;

  const isOwned = item.user.id === me!.id;

  const title = (() => {
    const healthActivityTitle = item.health_activity?.title;
    if (healthActivityTitle) return healthActivityTitle;

    switch (item.type) {
      case FeedItemType.LeagueJoined:
        return `${
          isOwned ? 'You have' : `${item.user.name} has`
        } joined league "${item.league!.name}"`;

      case FeedItemType.LeagueEnding:
        return `League "${item.league!.name}" is ending soon!`;

      case FeedItemType.LeagueReset:
        return `League "${item.league!.name}" was just restarted!`;

      case FeedItemType.LeagueWon:
        return `${isOwned ? `You` : `${item.user.name}`} won "${
          item.league!.name
        }"! `;

      case FeedItemType.TierUp:
        return `${
          isOwned ? `You've` : `${item.user.name} has`
        } been promoted to "${item.tier}"! `;

      case FeedItemType.TierDown: {
        return `${
          isOwned ? `You've` : `${item.user.name} has`
        } been demoted to "${item.tier}"! `;
      }

      case FeedItemType.RewardClaimed: {
        return `${isOwned ? `You have` : `${item.user.name} has`} claimed "${
          item.reward!.name_short
        }" reward! `;
      }

      case FeedItemType.RewardUnlocked: {
        return `${isOwned ? `You have` : `${item.user.name} has`} unlocked "${
          item.reward!.name_short
        }" reward! `;
      }

      case FeedItemType.NewFollower: {
        return `${item.related_user!.name} followed you. Check it out.`;
      }

      case FeedItemType.DailyGoalReached: {
        let goalName;

        switch (item.goal_type) {
          case FeedGoalType.FloorsClimbed:
            goalName = 'floors climbed';
            break;

          case FeedGoalType.Steps:
            goalName = 'steps';
            break;

          case FeedGoalType.SleepHours:
            goalName = 'sleep';
            break;

          case FeedGoalType.MindfulnessMinutes:
            goalName = 'mindfulness';
            break;

          case FeedGoalType.WaterLitres:
            goalName = 'hydration';
            break;

          default:
            break;
        }

        return `${isOwned ? 'You have just' : `${item.user.name}`} hit ${
          isOwned ? 'your' : 'their'
        } ${goalName} goal${isOwned ? ', keep it up!' : `.`}`;
      }

      default:
        return 'Feed Entry';
    }
  })();

  const date = formatRelative(new Date(item.created_at), new Date());

  const images =
    item.health_activity?.images.map(image => image.url_128x128) || [];

  const usersLikedAvatars = item.likes.map(
    likingUser => likingUser.avatar?.url_128x128 || '',
  );

  const LikeButton = isLiked ? (
    <Icon name={'thumb-solid'} color={colors.accent} size={16} />
  ) : (
    <Icon name={'thumb'} color={colors.accentSecondary} size={16} />
  );

  const getTargetUser = () => {
    let avatarUser = item.user;

    switch (item.type) {
      case FeedItemType.NewFollower:
        avatarUser = item.related_user!;
    }

    return avatarUser;
  };

  function getActivityIcon(sport: string) {
    switch (sport) {
      case 'running':
        return 'run';

      case 'cycling':
        return 'bike';

      case 'walking':
        return 'walking-solid';

      case 'sleep':
        return 'sleep';

      case 'swimming':
        return 'swim';

      case 'crossfitTraining':
        return 'crossfit';

      case 'highIntensityIntervalTraining':
        return 'hit';

      case 'skiing':
        return 'skiing';

      case 'hiking':
        return 'hike';

      case 'snowboarding':
        return 'snowboarding';

      case 'rowing':
        return 'rowing';

      case 'surfing':
        return 'surfing';

      case 'yoga':
        return 'yoga';

      case 'spinning':
        return 'bike';

      case 'weightLifting':
        return 'crossfit';

      case 'tennis':
        return 'tennis';

      case 'golf':
        return 'golf';

      default:
        return 'generic';
    }
  }

  const renderTitleIcon = () => {
    if (!item.health_activity) return null;
    const {health_activity} = item;

    return health_activity.sport.icon_url ? (
      <Image
        style={{height: 18, width: 18, marginRight: 5, marginTop: 2}}
        source={{uri: health_activity.sport.icon_url}}
      />
    ) : null;
  };

  const renderPoints = () => {
    return (
      !!item.health_activity && (
        <Chip text={`${item.health_activity?.points} points`} disabled={true} />
      )
    );
  };

  const renderStats = () => {
    return (
      <SpacedRow>
        <FeedStatLabel label={'Distance'} value={distance} />
        <FeedStatLabel label={'Speed'} value={speed} />
        <FeedStatLabel label={'Time'} value={duration} />
      </SpacedRow>
    );
  };

  const onContentPress = () => {
    switch (item.type) {
      case FeedItemType.NewFollower:
        navigation.navigate('Profile', {id: item.related_user!.id});
        break;

      case FeedItemType.HealthActivity:
        navigation.navigate('HealthActivityDetails', {
          id: item.health_activity!.id,
        });
        break;

      case FeedItemType.LeagueEnding:
      case FeedItemType.LeagueJoined:
      case FeedItemType.LeagueReset:
      case FeedItemType.LeagueWon:
        navigation.navigate('League', {
          id: item.league!.id,
        });
        break;

      case FeedItemType.RewardClaimed:
      case FeedItemType.RewardUnlocked:
        navigation.navigate('Reward', {id: item.reward!.id});
        break;

      default:
        break;
    }
  };

  const renderAvatar = () => {
    let icon: string | undefined;

    switch (item.type) {
      case FeedItemType.LeagueEnding:
      case FeedItemType.LeagueJoined:
      case FeedItemType.LeagueReset:
      case FeedItemType.LeagueWon:
        icon = 'leagues';
        break;

      case FeedItemType.RewardClaimed:
      case FeedItemType.RewardUnlocked:
        icon = 'reward';
        break;

      case FeedItemType.TierDown:
      case FeedItemType.TierUp:
        icon = 'crown';
        break;

      case FeedItemType.DailyGoalReached:
        switch (item.goal_type) {
          case FeedGoalType.FloorsClimbed:
            icon = 'stairs';
            break;

          case FeedGoalType.MindfulnessMinutes:
            icon = 'yoga';
            break;

          case FeedGoalType.SleepHours:
            icon = 'sleep';
            break;

          case FeedGoalType.Steps:
            icon = 'steps';
            break;

          case FeedGoalType.WaterLitres:
            icon = 'water';
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }

    if (icon) {
      return (
        <IconContainer>
          <Icon name={icon || 'default'} size={28} color={colors.accent} />
        </IconContainer>
      );
    }

    const targetUser = getTargetUser();

    return (
      <TouchHandler
        disabled={me!.id === targetUser.id}
        onPress={() => {
          if (me!.id !== targetUser.id) {
            navigation.navigate('Profile', {id: targetUser.id});
          }
        }}>
        <ProgressCircle
          progress={targetUser.goal_percentage}
          strokeWidth={2.5}
          backgroundStrokeWidth={2}
          bloomIntensity={0.5}
          bloomRadius={5}
          size={52}>
          <Avatar url={targetUser.avatar?.url_128x128} size={44} />
        </ProgressCircle>
      </TouchHandler>
    );
  };

  return (
    <Wrapper>
      <Row>
        {renderAvatar()}

        <RightContainer>
          <TouchHandler onPress={onContentPress}>
            <SpacedRow>
              {/* User name, date column */}
              <Col style={{flex: 1}}>
                <Row
                  style={{
                    alignItems: 'flex-start',
                    marginRight: 5,
                  }}>
                  {renderTitleIcon()}
                  <Label
                    type="subheading"
                    appearance={'primary'}
                    style={{flexShrink: 1, paddingRight: 5}}>
                    {title}
                  </Label>
                </Row>

                <DateText type="caption" appearance={'secondary'}>
                  {isOwned ? date : `${item.user.name} · ${date}`}
                </DateText>
              </Col>

              {/* Points chip */}
              {renderPoints()}
            </SpacedRow>

            {renderStats()}

            <SpacedRow>
              <FeedCollage images={images} />
            </SpacedRow>
          </TouchHandler>
        </RightContainer>
      </Row>

      <ButtonContainer>
        <Button
          onPress={() => {
            isLiked
              ? dislike({feedItemId: item.id, userId: item.user.id})
              : like({feedItemId: item.id, userId: item.user.id});
          }}>
          {LikeButton}
          <UserCounter
            style={{marginLeft: 8}}
            countTotal={item.likes.length}
            avatars={usersLikedAvatars}
          />
        </Button>
        {/* <ButtonSeparator />
        <Button>
          <Icon name={'camera'} color={colors.accentSecondary} size={18} />
        </Button> */}
      </ButtonContainer>
    </Wrapper>
  );
};

export const FeedItem = React.memo(_FeedItem);
