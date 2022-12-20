import {UserCounter} from 'components/common/UserCounter';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Image, View, Text} from 'react-native';
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
  formatDateWithoutOffset,
  formatDistanceShortLocale,
  getActivityDistance,
  getSpeedValue,
  heightLize,
  widthLize,
} from '@utils';
import {useLike, useDislike, useMe} from '@hooks';
import {
  FeedGoalType,
  FeedItemType,
} from '@fitlink/api/src/modules/feed-items/feed-items.constants';

const Wrapper = styled.View(({theme}) => ({
  paddingVertical: 15,
  // marginHorizontal: 20,
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
  borderRadius: 18,
  height: widthLize(76),
  width: widthLize(76),
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

// const TitleText = styled.Text({
//   color: 'white',
//   fontFamily: 'Roboto',
// });

const TitleText = styled(Label)({
  fontWeight: '400',
  color: '#00E9D7',
  fontSize: 16,
  lineHeight: 18,
});

const NameText = styled(Label)({
  fontWeight: '400',
  color: '#FFFFFF',
  fontSize: 14,
  lineHeight: 16,
});

const LikeImage = styled.Image({
  width: widthLize(22),
  height: widthLize(22),
});

interface FeedItemProps {
  item: FeedItemClass;
  unitSystem: UnitSystem;
  isLiked: boolean;
  index: number;
}

export const _FeedItem = ({
  item,
  unitSystem,
  isLiked,
  index,
}: FeedItemProps) => {
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
    ? (new Date(item.health_activity.end_time).valueOf() -
        new Date(item.health_activity.start_time).valueOf()) /
      1000
    : undefined;

  const speed =
    item.health_activity?.distance && durationInSeconds
      ? (getSpeedValue(
          item.health_activity.sport?.name_key,
          item.health_activity.distance,
          item.health_activity.active_time || durationInSeconds,
          unitSystem,
        ) as string)
      : undefined;

  const isOwned = item.user.id === me!.id;

  function newTitle(): string {
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

          case FeedGoalType.ActiveMinutes:
            goalName = 'active minutes';
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
  }

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

          case FeedGoalType.ActiveMinutes:
            goalName = 'active minutes';
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

  // Health activity dates are displayed in the user's local time
  const formattedHealthActivityDate =
    item.health_activity?.start_time &&
    formatDateWithoutOffset(
      new Date(
        new Date(item.health_activity.start_time).valueOf() +
          (item.health_activity.utc_offset || 0) * 1000,
      ),
      new Date(Date.now() + (item.health_activity.utc_offset || 0) * 1000),
    );

  const date =
    formattedHealthActivityDate ||
    formatRelative(new Date(item.date), new Date());

  const images =
    item.health_activity?.images.map(image => image.url_128x128) || [];

  // @ts-ignore
  const usersLikedAvatars = item?.likes?.map(
    (likingUser: any) => likingUser.avatar?.url_128x128 || '',
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

          case FeedGoalType.ActiveMinutes:
            icon = 'stopwatch';
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
          <Icon
            name={icon || 'default'}
            size={widthLize(52)}
            color={colors.accent}
          />
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

  if (item.health_activity?.title) {
    const targetUser = getTargetUser();
    return (
      <TouchHandler onPress={onContentPress}>
        <View>
          <View
            style={{
              height: index === 0 ? 0 : 3,
              backgroundColor: 'rgba(86, 86, 86, 0.5)',
              borderRadius: 1.5,
            }}
          />
          <View style={{height: heightLize(14)}} />
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchHandler
                disabled={me!.id === targetUser.id}
                onPress={() => {
                  if (me!.id !== targetUser.id) {
                    navigation.navigate('Profile', {id: targetUser.id});
                  }
                }}>
                <Avatar
                  url={targetUser.avatar?.url_128x128}
                  size={widthLize(76)}
                  radius={18}
                />
              </TouchHandler>
              <View style={{width: widthLize(12)}} />
              <View>
                <TitleText>{item.health_activity?.title}</TitleText>
                <View style={{height: heightLize(6)}} />
                <NameText>{item.user.name}</NameText>
                <View style={{height: heightLize(6)}} />
                <NameText style={{color: '#ACACAC'}}>{date}</NameText>
              </View>
            </View>
            <View style={{width: widthLize(17)}} />
            <View style={{alignItems: 'flex-end', flex: 1}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View
                  style={{
                    paddingHorizontal: widthLize(12),
                    paddingVertical: heightLize(8),
                    backgroundColor: 'white',
                    borderRadius: 20,
                    marginRight: widthLize(12),
                  }}>
                  <NameText
                    style={{color: 'black', fontWeight: '500', fontSize: 12}}>
                    {`${item.health_activity?.points} Points`}
                  </NameText>
                </View>
                <TouchHandler
                  onPress={() => {
                    isLiked
                      ? dislike({feedItemId: item.id, userId: item.user.id})
                      : like({feedItemId: item.id, userId: item.user.id});
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: widthLize(36),
                      height: widthLize(36),
                      borderRadius: widthLize(18),
                      backgroundColor: isLiked
                        ? colors.accent
                        : colors.accentSecondary,
                    }}>
                    <LikeImage
                      source={require('../../../assets/images/thumbs-up-new.png')}
                    />
                  </View>
                </TouchHandler>
              </View>
              <View style={{height: heightLize(15)}} />
              <NameText style={{color: '#ACACAC'}}>
                Distance: <NameText>{distance}</NameText>
                {'  '}
                <Image
                  source={require('../../../assets/images/feed_location.png')}
                />
              </NameText>
              <View style={{height: heightLize(10)}} />
              <NameText style={{color: '#ACACAC'}}>
                Speed: <NameText>{speed}</NameText>
                {'  '}
                <Image
                  source={require('../../../assets/images/feed_speed.png')}
                />
              </NameText>
              <View style={{height: heightLize(10)}} />
              <NameText style={{color: '#ACACAC'}}>
                Time: <NameText>{duration}</NameText>
                {'  '}
                <Image
                  source={require('../../../assets/images/feed_time.png')}
                />
              </NameText>
            </View>
          </View>
          <View style={{height: heightLize(14)}} />
        </View>
      </TouchHandler>
    );
  } else {
    return (
      <TouchHandler onPress={onContentPress}>
        <View>
          <View
            style={{
              height: index === 0 ? 0 : 3,
              backgroundColor: 'rgba(86, 86, 86, 0.5)',
              borderRadius: 1.5,
            }}
          />
          <View style={{height: heightLize(14)}} />
          <View style={{flexDirection: 'row', flex: 1}}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              {renderAvatar()}
              <View style={{width: widthLize(12)}} />
              <View style={{flex: 1}}>
                <TitleText style={{}}>{newTitle()}</TitleText>
                {/* <TitleText>You just hit your floors</TitleText> */}
                <View style={{height: heightLize(6)}} />
                <NameText style={{color: '#ACACAC'}}>{date}</NameText>
              </View>
            </View>
            <View style={{width: widthLize(17)}} />
            <View style={{alignItems: 'flex-end'}}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchHandler
                  onPress={() => {
                    isLiked
                      ? dislike({feedItemId: item.id, userId: item.user.id})
                      : like({feedItemId: item.id, userId: item.user.id});
                  }}>
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: widthLize(36),
                      height: widthLize(36),
                      borderRadius: widthLize(18),
                      backgroundColor: isLiked
                        ? colors.accent
                        : colors.accentSecondary,
                    }}>
                    <LikeImage
                      source={require('../../../assets/images/thumbs-up-new.png')}
                    />
                  </View>
                </TouchHandler>
              </View>
            </View>
          </View>
          <View style={{height: heightLize(14)}} />
        </View>
      </TouchHandler>
    );
    // return (
    //   <Wrapper>
    //     <Row>
    //       {renderAvatar()}

    //       <RightContainer>
    //         <TouchHandler onPress={onContentPress}>
    //           <SpacedRow>
    //             {/* User name, date column */}
    //             <Col style={{flex: 1}}>
    //               <Row
    //                 style={{
    //                   alignItems: 'flex-start',
    //                   marginRight: 5,
    //                 }}>
    //                 {renderTitleIcon()}
    //                 <Label
    //                   type="subheading"
    //                   appearance={'primary'}
    //                   style={{flexShrink: 1, paddingRight: 5}}>
    //                   {title}
    //                 </Label>
    //               </Row>

    //               <DateText type="caption" appearance={'secondary'}>
    //                 {isOwned ? date : `${item.user.name} · ${date}`}
    //               </DateText>
    //             </Col>

    //             {/* Points chip */}
    //             {renderPoints()}
    //           </SpacedRow>

    //           {renderStats()}

    //           <SpacedRow>
    //             <FeedCollage images={images} />
    //           </SpacedRow>
    //         </TouchHandler>
    //       </RightContainer>
    //     </Row>

    //     <ButtonContainer>
    //       <Button
    //         style={{height: '100%'}}
    //         onPress={() => {
    //           isLiked
    //             ? dislike({feedItemId: item.id, userId: item.user.id})
    //             : like({feedItemId: item.id, userId: item.user.id});
    //         }}>
    //         {LikeButton}
    //         <UserCounter
    //           style={{marginLeft: 8}}
    //           countTotal={item.likes.length}
    //           avatars={usersLikedAvatars}
    //         />
    //       </Button>
    //       {/* <ButtonSeparator />
    //     <Button>
    //       <Icon name={'camera'} color={colors.accentSecondary} size={18} />
    //     </Button> */}
    //     </ButtonContainer>
    //   </Wrapper>
    // );
  }
};

export const FeedItem = React.memo(_FeedItem);
