import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {
  Dimensions,
  ImageBackground,
  ListRenderItem,
  View,
  Image as RNImage,
  StyleSheet,
  Text,
} from 'react-native';
import {Avatar, Icon, ProgressCircle, TouchHandler} from '../common';
import {formatDistanceStrict, formatRelative} from 'date-fns';
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
import {useDislike, useLike, useMe} from '@hooks';
import {
  FeedGoalType,
  FeedItemType,
} from '@fitlink/api/src/modules/feed-items/feed-items.constants';
import Carousel, {Pagination} from 'react-native-snap-carousel';
import {Image} from '@fitlink/api/src/modules/images/entities/image.entity';
import {
  UserPublic,
  User,
} from '@fitlink/api/src/modules/users/entities/user.entity';
import LinearGradient from 'react-native-linear-gradient';

const {width} = Dimensions.get('window');

const IconContainer = styled.View(({theme: {colors}}) => ({
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 18,
  height: widthLize(76),
  width: widthLize(76),
  backgroundColor: colors.surface,
}));

const TitleText = styled(Text)({
  color: '#FFFFFF',
  fontWeight: 500,
  fontFamily: 'Roboto',
  fontSize: 16,
  lineHeight: 18,
});

const NameText = styled(Text)({
  color: '#FFFFFF',
  fontWeight: 500,
  fontFamily: 'Roboto',
  fontSize: 14,
  lineHeight: 16,
});

const LikeImage = styled.Image({
  width: widthLize(22),
  height: widthLize(22),
});

const SBackgroundOverlay = styled(LinearGradient).attrs(() => ({
  start: {x: 1, y: 0},
  end: {x: 0, y: 0},
  colors: ['rgba(6, 6, 6, 0.85)', 'rgba(6, 6, 6, 0)'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

interface FeedItemProps {
  item: FeedItemClass;
  unitSystem: UnitSystem;
  isLiked: boolean;
  index: number;
}

export const _FeedItem = ({item, unitSystem, isLiked}: FeedItemProps) => {
  const {colors} = useTheme();
  const navigation = useNavigation();

  const [activeDotIndex, setActiveDotIndex] = useState(0);

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
        return `${isOwned ? 'You' : `${item.user.name}`} won "${
          item.league!.name
        }"! `;

      case FeedItemType.TierUp:
        return `${
          isOwned ? "You've" : `${item.user.name} has`
        } been promoted to "${item.tier}"! `;

      case FeedItemType.TierDown: {
        return `${
          isOwned ? "You've" : `${item.user.name} has`
        } been demoted to "${item.tier}"! `;
      }

      case FeedItemType.RewardClaimed: {
        return `${isOwned ? 'You have' : `${item.user.name} has`} claimed "${
          item.reward!.name_short
        }" reward! `;
      }

      case FeedItemType.RewardUnlocked: {
        return `${isOwned ? 'You have' : `${item.user.name} has`} unlocked "${
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
        } ${goalName} goal${isOwned ? ', keep it up!' : '.'}`;
      }

      default:
        return 'Feed Entry';
    }
  }

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

  const getTargetUser = () => {
    let avatarUser = item.user;

    switch (item.type) {
      case FeedItemType.NewFollower:
        avatarUser = item.related_user!;
    }

    return avatarUser;
  };

  const onContentPress = () => {
    switch (item.type) {
      case FeedItemType.NewFollower:
        navigation.navigate('Profile', {id: item.related_user!.id});
        break;

      case FeedItemType.HealthActivity:
        navigation.navigate('ActivityPage', {
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

  const FeedItemAvatar = ({targetUser}: {targetUser: User | UserPublic}) => (
    <View style={{flexDirection: 'row', flex: 1}}>
      <TouchHandler
        disabled={me!.id === targetUser.id}
        onPress={() => {
          if (me!.id !== targetUser.id) {
            navigation.navigate('Profile', {
              id: targetUser.id,
            });
          }
        }}>
        <Avatar
          url={targetUser.avatar?.url_128x128}
          size={widthLize(76)}
          radius={18}
        />
      </TouchHandler>
      <View
        style={{
          marginLeft: widthLize(18),
          marginRight: widthLize(17),
        }}>
        <TitleText numberOfLines={1}>{item.health_activity?.title}</TitleText>
        <View style={{height: heightLize(6)}} />
        <NameText numberOfLines={1}>{item.user.name}</NameText>
        <View style={{height: heightLize(6)}} />
        <NameText>{date}</NameText>
      </View>
    </View>
  );

  const FeedItemLise = () => {
    const toggleLike = () => {
      if (isLiked) {
        dislike({feedItemId: item.id, userId: item.user.id});
      } else {
        like({feedItemId: item.id, userId: item.user.id});
      }
    };

    return (
      <TouchHandler onPress={toggleLike}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            width: widthLize(36),
            height: widthLize(36),
            borderRadius: widthLize(18),
            borderWidth: 1,
            borderColor: isLiked ? colors.accent : colors.text,
            backgroundColor: isLiked ? colors.accent : colors.background,
          }}>
          <Icon
            name="thumb"
            size={17}
            fill={isLiked ? colors.background : colors.text}
            disabled
          />
        </View>
      </TouchHandler>
    );
  };

  const FeedItemActions = () => (
    <View
      style={{
        alignItems: 'flex-end',
        flex: 1,
        justifyContent: 'space-between',
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View
          style={{
            paddingHorizontal: widthLize(12),
            paddingVertical: heightLize(8),
            borderColor: 'white',
            borderWidth: 1,
            borderRadius: 20,
            marginRight: widthLize(12),
          }}>
          <NameText style={{fontSize: 12}}>
            {`${item.health_activity?.points} Points`}
          </NameText>
        </View>
        <FeedItemLise />
      </View>
      <View style={{alignItems: 'flex-end'}}>
        {!!distance && (
          <NameText style={{fontWeight: '300', marginTop: 15}}>
            Distance: <NameText>{distance}</NameText>
          </NameText>
        )}
        {!!speed && (
          <NameText style={{marginTop: 8}}>
            Speed: <NameText>{speed}</NameText>
          </NameText>
        )}
        {!!duration && (
          <NameText style={{marginTop: 8}}>
            Time: <NameText>{duration}</NameText>
          </NameText>
        )}
      </View>
    </View>
  );

  if (item.health_activity?.title) {
    const targetUser = getTargetUser();
    const images = item.health_activity.images;
    const showCarousel = !!images?.length;

    if (showCarousel) {
      const renderCarouselItem: ListRenderItem<Image> = ({
        item: image,
        index: idx,
      }) => {
        return (
          <TouchHandler onPress={onContentPress} style={{flex: 1}} key={idx}>
            <ImageBackground
              source={{uri: image.url_640x360}}
              style={{width: '100%', flex: 1, height: 291}}>
              <SBackgroundOverlay />
              <View
                style={{
                  flex: 1,
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  alignItems: 'flex-start',
                }}>
                <View style={{flexDirection: 'row', flex: 1}}>
                  <FeedItemAvatar targetUser={targetUser} />
                  <FeedItemActions />
                </View>
              </View>
            </ImageBackground>
          </TouchHandler>
        );
      };

      return (
        <View>
          <Carousel
            data={images}
            renderItem={renderCarouselItem}
            sliderWidth={width}
            itemWidth={width}
            onSnapToItem={slideIndex => setActiveDotIndex(slideIndex)}
          />
          <Pagination
            dotsLength={images.length}
            activeDotIndex={activeDotIndex}
            dotColor={'#fff'}
            inactiveDotColor={'#ddd'}
            dotStyle={styles.dot}
            inactiveDotOpacity={0.4}
            inactiveDotScale={1}
            containerStyle={styles.paginationContainer}
          />
        </View>
      );
    }
    return (
      <TouchHandler onPress={onContentPress}>
        <View
          style={{
            paddingVertical: 18,
            marginHorizontal: widthLize(20),
            height: 157,
          }}>
          <View style={{flexDirection: 'row', flex: 1}}>
            <FeedItemAvatar targetUser={targetUser} />
            <FeedItemActions />
          </View>
        </View>
      </TouchHandler>
    );
  }

  return (
    <TouchHandler onPress={onContentPress}>
      <View
        style={{
          paddingVertical: 22,
          marginHorizontal: widthLize(20),
        }}>
        <View style={{flexDirection: 'row', flex: 1}}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            {renderAvatar()}
            <View style={{width: widthLize(12)}} />
            <View style={{flex: 1}}>
              <TitleText>{newTitle()}</TitleText>
              <View style={{height: heightLize(6)}} />
              <NameText>{date}</NameText>
            </View>
          </View>
          <View style={{width: widthLize(17)}} />
          <View style={{alignItems: 'flex-end'}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <FeedItemLise />
            </View>
          </View>
        </View>
      </View>
    </TouchHandler>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 0,
    zIndex: 10,
    alignSelf: 'center',
  },
});

export const FeedItem = React.memo(_FeedItem);
