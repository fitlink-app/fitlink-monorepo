import {
  Label,
  TouchHandler,
  Avatar,
  Button,
  TouchHandlerProps,
} from '@components';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Notification as NotificationClass} from '@fitlink/api/src/modules/notifications/entities/notification.entity';
import {formatDistanceToNow} from 'date-fns';
import {NotificationAction} from '@fitlink/api/src/modules/notifications/notifications.constants';

/** Styled Components */
const Wrapper = styled.View({
  width: '100%',
});

const BottomSeparator = styled.View({
  height: 1,
  marginHorizontal: 20,
});

const Flex = styled.View({
  flex: 1,
});

const ContentContainer = styled.View({
  marginHorizontal: 20,
  paddingVertical: 15,
});

const Row = styled.View({
  flexDirection: 'row',
});

const NotificationDetailsContainer = styled(Flex)({
  justifyContent: 'center',
  marginLeft: 15,
});

const Name = styled(Label).attrs(() => ({
  type: 'body',
  appearance: 'primary',
}))({
  fontSize: 16,
  lineHeight: 25,
});

const Message = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'primary',
}))({
  fontSize: 14,
  lineHeight: 21,
});

const Subject = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
  bold: true,
}))({});

const Time = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'secondary',
}))({
  fontSize: 13
});

const ButtonsContainer = styled.View({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  marginTop: 10,
});

const ButtonSpacer = styled.View({width: 10});

const UnreadMark = styled.View(({theme: {colors}}) => ({
  borderRadius: 99,
  width: 13,
  height: 13,
  backgroundColor: colors.danger,
  position: 'absolute',
  left: 0,
  top: -3,
  borderColor: colors.background,
  borderWidth: 2,
}));

interface NotificationProps extends TouchHandlerProps {
  item: NotificationClass;
}

export const Notification = ({item, ...rest}: NotificationProps) => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  const avatar = item.avatar?.url_128x128;

  const generateOnPressAction = (): {(): void} | null => {
    switch (item.action) {
      case NotificationAction.ActivityLiked:
        return item.subject_id
          ? () =>
              navigation.navigate('HealthActivityDetails', {
                id: item.subject_id,
              })
          : null;

      case NotificationAction.LeagueWon:
      case NotificationAction.LeagueReset:
      case NotificationAction.LeagueEnding:
        return item.subject_id
          ? () =>
              navigation.navigate('League', {
                id: item.subject_id,
              })
          : null;

      case NotificationAction.LeagueInvitation:
        return () =>
          navigation.navigate('Leagues', {
            tab: 2,
          });

      case NotificationAction.RewardUnlocked:
        return item.subject_id
          ? () =>
              navigation.navigate('Reward', {
                id: item.subject_id,
              })
          : null;

      case NotificationAction.GoalAchieved:
      case NotificationAction.GoalProgressSteps:
        return () => navigation.goBack();

      case NotificationAction.NewFollower:
        return () => navigation.navigate('Profile', {id: item.subject_id!});

      default:
        return null;
    }
  };

  const renderMessage = () => {
    switch (item.action) {
      case NotificationAction.ActivityLiked:
        return (
          <Message>
            ❤️ You've got love. <Subject>{item.subject}</Subject> just liked
            your <Subject>{item.meta_value}</Subject>. Check it out.
          </Message>
        );

      case NotificationAction.GoalAchieved:
        return (
          <Message>
            🎉 Nailed it. You just hit your <Subject>{item.subject}</Subject>{' '}
            goal. Keep it up.
          </Message>
        );

      case NotificationAction.GoalProgressSteps:
        return (
          <Message>
            👣 So close to reaching your steps goal. Just a brisk walk should do
            it.
          </Message>
        );

      case NotificationAction.LeagueEnding:
        return (
          <Message>
            📢 Remember, the league <Subject>{item.subject}</Subject> will end
            in 24 hours. You still have time.
          </Message>
        );

      case NotificationAction.LeagueInvitation:
        return (
          <Message>
            🎉 <Subject>{item.meta_value}</Subject> just invited you to join the
            league <Subject>{item.subject}</Subject>. Let's go!
          </Message>
        );

      case NotificationAction.LeagueReset:
        return (
          <Message>
            ⏱ Heads up, the league <Subject>{item.subject}</Subject> has just
            reset. Go for it.
          </Message>
        );

      case NotificationAction.LeagueWon:
        return (
          <Message>
            👏 Winner! You just won the league <Subject>{item.subject}</Subject>
            . Check it out.
          </Message>
        );

      case NotificationAction.NewFollower:
        return (
          <Message>
            👋 <Subject>{item.subject}</Subject> followed you. Check it out.
          </Message>
        );

      case NotificationAction.RankDown:
        return (
          <Message>
            👎 Ouch! Your rank dropped to <Subject>{item.subject}</Subject>. You
            can do it.
          </Message>
        );

      case NotificationAction.RankUp:
        return (
          <Message>
            👍 Nice. You ranked up to <Subject>{item.subject}</Subject>. Keep it
            going.
          </Message>
        );

      case NotificationAction.RewardUnlocked:
        return (
          <Message>
            🎁 You just unlocked a new reward <Subject>{item.subject}</Subject>.
            Check it out.
          </Message>
        );

      default:
        return null;
    }
  };

  // Renders additional views based on action type
  const renderAdditional = () => {
    return null;

    // TODO: Additional stuff for more complex views, buttons to take action, etc.

    // switch (item.action) {
    //   case NotificationAction.ActivityLiked:
    //     return (
    //       <ButtonsContainer>
    //         <Button
    //           text={'Decline'}
    //           style={{maxWidth: 100, maxHeight: 30}}
    //           containerStyle={{maxHeight: 30}}
    //           outline
    //           textStyle={{fontSize: 12}}
    //         />

    //         <ButtonSpacer />

    //         <Button
    //           text={'Accept'}
    //           style={{maxWidth: 100, maxHeight: 30}}
    //           containerStyle={{maxHeight: 30}}
    //           textStyle={{fontSize: 12}}
    //         />
    //       </ButtonsContainer>
    //     );

    //   default:
    //     return null;
    // }
  };

  const onPressAction = generateOnPressAction();

  const handleOnPress = () => {
    if (typeof onPressAction === 'function') onPressAction();
  };

  return (
    <TouchHandler
      {...rest}
      onPress={handleOnPress}
      disabled={!onPressAction}
      style={{
        backgroundColor: item.seen ? undefined : colors.surface,
      }}>
      <Wrapper>
        <ContentContainer>
          <Row style={{alignItems: 'flex-start'}}>
            <Avatar url={avatar} size={49} radius={10} />
            <Row style={{flex: 1}}>
              <NotificationDetailsContainer>
                <Row style={{marginBottom: 2, justifyContent: 'space-between', alignItems: 'center'}}>
                  <Name>{item.title}</Name>
                  <Time>
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </Time>
                </Row>

                {renderMessage()}

                {/* Buttons? */}
                {renderAdditional()}
              </NotificationDetailsContainer>
            </Row>

            {!item.seen && <UnreadMark />}
          </Row>
        </ContentContainer>

        <BottomSeparator
          style={{backgroundColor: item.seen ? '#2e2e2e' : '#3b3b3b'}}
        />
      </Wrapper>
    </TouchHandler>
  );
};
