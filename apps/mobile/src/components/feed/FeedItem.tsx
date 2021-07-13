import {UserCounter} from 'components/common/UserCounter';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Avatar, Chip, Icon, Label, TouchHandler} from '../common';
import {FeedCollage} from './FeedCollage';
import {FeedStatLabel} from './FeedStatLabel';

const Wrapper = styled.View(({theme}) => ({
  paddingVertical: 15,
  marginHorizontal: 20,
  borderColor: theme.colors.separator,
}));

const TopWrapper = styled.View({});

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

export const FeedItem = () => {
  const {colors} = useTheme();

  // Temp variables
  const isLiked = false;
  const title = 'Afternoon Run';
  const date = 'today at 2:15pm';
  const points = 5;
  const images = [
    'https://source.unsplash.com/random/1024x763',
    'https://source.unsplash.com/random/1024x764',
    'https://source.unsplash.com/random/1024x765',
    'https://source.unsplash.com/random/1024x766',
  ];

  const LikeButton = isLiked ? (
    <Icon name={'thumb-solid'} color={colors.accent} size={16} />
  ) : (
    <Icon name={'thumb'} color={colors.accentSecondary} size={16} />
  );

  const renderTitleIcon = () => {
    return (
      <Icon
        name={'run'}
        size={18}
        style={{marginRight: 5, marginTop: 2}}
        color={colors.accentSecondary}
      />
    );
  };

  const renderPoints = () => {
    return <Chip text={`${points} points`} disabled={true} />;
  };

  const renderStats = () => {
    return (
      <SpacedRow>
        <FeedStatLabel label={'Distance'} value={'16.2 km'} />

        <FeedStatLabel label={'Speed'} value={'5:03/km'} />

        <FeedStatLabel label={'Time'} value={'31m'} />
      </SpacedRow>
    );
  };

  return (
    <Wrapper>
      <Row>
        <Avatar url={'https://i.pravatar.cc/512'} size={44} />

        <RightContainer>
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
                {date}
              </DateText>
            </Col>

            {/* Points chip */}
            {renderPoints()}
          </SpacedRow>

          {renderStats()}

          <SpacedRow>
            <FeedCollage images={images} />
          </SpacedRow>
        </RightContainer>
      </Row>

      <ButtonContainer>
        <Button>
          {LikeButton}
          <UserCounter
            style={{marginLeft: 8}}
            countTotal={29}
            avatars={[
              'https://i.pravatar.cc/80',
              'https://i.pravatar.cc/81',
              'https://i.pravatar.cc/82',
              'https://i.pravatar.cc/83',
              'https://i.pravatar.cc/84',
            ]}
          />
        </Button>
        <ButtonSeparator />
        <Button>
          <Icon name={'share'} color={colors.accentSecondary} size={16} />
        </Button>
      </ButtonContainer>
    </Wrapper>
  );
};
