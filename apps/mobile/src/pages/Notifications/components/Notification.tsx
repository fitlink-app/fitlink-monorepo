import {Label, TouchHandler, Avatar, Button} from '@components';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';

/** Styled Components */
const Wrapper = styled.View({
  width: '100%',
  minHeight: 74,
});

const BottomSeparator = styled.View({
  height: 1,
  marginHorizontal: 20,
});

const Flex = styled.View({
  flex: 1,
});

const ContentContainer = styled(Flex)({
  marginHorizontal: 20,
  paddingVertical: 15,
});

const Row = styled.View({
  flexDirection: 'row',
});

const FlexRow = styled(Row)({
  flex: 1,
  alignItems: 'center',
});

const NotificationDetailsContainer = styled(Flex)({
  justifyContent: 'center',
  marginLeft: 15,
});

const Name = styled(Label).attrs(() => ({
  type: 'body',
  appearance: 'primary',
  bold: true,
}))({});

const Message = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'primary',
}))({});

const Subject = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
  bold: true,
}))({});

const Time = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'secondary',
}))({});

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

interface NotificationProps {}

export const Notification = (props: NotificationProps) => {
  const navigation = useNavigation();
  const {colors} = useTheme();

  // TEMP VARS
  const avatar = 'https://source.unsplash.com/random/250%C3%97180/?person';
  const isRead = Math.random() < 0.5;
  const title = 'Ralph Edwards';
  const user = 'Ralph Edwards';
  const action = 'league_invite';
  const subject = 'Run for your Live';
  const time = '5 min ago';

  const handleOnPress = () => {
    // TODO
  };

  const renderMessage = () => {
    switch (action) {
      case 'league_invite':
        return (
          <Message>
            {user} invited you to <Subject>{subject}</Subject> league.
          </Message>
        );

      default:
        return null;
    }
  };

  // Renders additional views based on action type
  const renderAdditional = () => {
    switch (action) {
      case 'league_invite':
        return (
          <ButtonsContainer>
            <Button
              text={'Decline'}
              style={{maxWidth: 100, maxHeight: 30}}
              containerStyle={{maxHeight: 30}}
              outline
              textStyle={{fontSize: 12}}
            />

            <ButtonSpacer />

            <Button
              text={'Accept'}
              style={{maxWidth: 100, maxHeight: 30}}
              containerStyle={{maxHeight: 30}}
              textStyle={{fontSize: 12}}
            />
          </ButtonsContainer>
        );

      default:
        return null;
    }
  };

  return (
    <TouchHandler
      onPress={handleOnPress}
      style={{backgroundColor: isRead ? undefined : colors.surface}}>
      <Wrapper>
        <ContentContainer>
          <FlexRow style={{alignItems: 'flex-start'}}>
            <Avatar url={avatar} size={44} />
            <FlexRow>
              <NotificationDetailsContainer>
                <Row style={{marginBottom: 5, justifyContent: 'space-between'}}>
                  <Name>{title}</Name>
                  <Time>{time}</Time>
                </Row>

                {renderMessage()}

                {/* Buttons? */}
                {renderAdditional()}
              </NotificationDetailsContainer>
            </FlexRow>

            {!isRead && <UnreadMark />}
          </FlexRow>
        </ContentContainer>
        <BottomSeparator
          style={{backgroundColor: isRead ? '#2e2e2e' : '#3b3b3b'}}
        />
      </Wrapper>
    </TouchHandler>
  );
};
