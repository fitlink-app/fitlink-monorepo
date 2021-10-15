import {UserCounter} from 'components/common/UserCounter';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {
  Avatar,
  Chip,
  Icon,
  IcoMoonIcon,
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
import {useLike, useDislike} from '@hooks';

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

  const {mutateAsync: like, isLoading: isLiking} = useLike();

  const {mutateAsync: dislike, isLoading: isDisliking} = useDislike();

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

  const title = item.health_activity ? item.health_activity.title : 'Entry';
  const date = formatRelative(new Date(item.created_at), new Date());

  const images =
    item.health_activity?.images.map(image => image.url_128x128) || [];

  const usersLikedAvatars = item.likes
    .map(likingUser => likingUser.avatar?.url_128x128)
    .filter(x => !!x);

  const LikeButton = isLiked ? (
    <Icon name={'thumb-solid'} color={colors.accent} size={16} />
  ) : (
    <Icon name={'thumb'} color={colors.accentSecondary} size={16} />
  );

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
    const icon = getActivityIcon(health_activity.sport.name_key);
    const safeIcon = icon
      ? IcoMoonIcon.hasIcon(icon)
        ? icon
        : 'walking-solid'
      : null;

    if (!safeIcon) return null;

    return (
      <Icon
        name={safeIcon}
        size={18}
        style={{marginRight: 5, marginTop: 2}}
        color={colors.accentSecondary}
      />
    );
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
    if (!item.health_activity) return;
    navigation.navigate('HealthActivityDetails', {id: item.health_activity.id});
  };

  return (
    <Wrapper>
      <Row>
        <TouchHandler
          onPress={() => {
            navigation.navigate('Profile', {id: item.user.id});
          }}>
          <ProgressCircle
            progress={0.33}
            strokeWidth={2.5}
            backgroundStrokeWidth={2}
            bloomIntensity={0.5}
            bloomRadius={5}
            size={52}>
            <Avatar url={item.user.avatar?.url_128x128} size={44} />
          </ProgressCircle>
        </TouchHandler>

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
                  {item.user.name} · {date}
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
