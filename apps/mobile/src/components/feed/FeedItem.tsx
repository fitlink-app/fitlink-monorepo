import {UserCounter} from 'components/common/UserCounter';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';
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
import {formatRelative} from 'date-fns';

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
  onContentPress: () => void;
}

export const _FeedItem = ({onContentPress}: FeedItemProps) => {
  const {colors} = useTheme();

  // Temp variables
  const isLiked = false;
  const name = 'Lana Smith';
  const title = 'Afternoon Hiking';
  const date = formatRelative(new Date('2021-08-24'), new Date());
  const points = 5;
  const images = [
    'https://source.unsplash.com/random/250%C3%97180/?hiking,woods',
    'https://source.unsplash.com/random/254%C3%97180/?hiking,woods',
    'https://source.unsplash.com/random/253%C3%97180/?hiking,woods',
    'https://source.unsplash.com/random/252%C3%97180/?hiking,woods',
    'https://source.unsplash.com/random/251%C3%97180/?hiking,woods',
  ];

  const description = `Some pics from our hike at Bear Creek Trail. This is our favourite spot!`;

  const LikeButton = isLiked ? (
    <Icon name={'thumb-solid'} color={colors.accent} size={16} />
  ) : (
    <Icon name={'thumb'} color={colors.accentSecondary} size={16} />
  );

  const renderTitleIcon = () => {
    return (
      <Icon
        name={'hike'}
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
        <ProgressCircle
          progress={0.33}
          strokeWidth={2.5}
          backgroundStrokeWidth={2}
          bloomIntensity={0.5}
          bloomRadius={5}
          size={52}>
          <Avatar url={'https://i.pravatar.cc/512'} size={44} />
        </ProgressCircle>

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
                  {name} · {date}
                </DateText>
              </Col>

              {/* Points chip */}
              {renderPoints()}
            </SpacedRow>

            {renderStats()}

            <Label
              type={'body'}
              appearance={'accentSecondary'}
              style={{marginBottom: 10}}>
              {description}
            </Label>

            <SpacedRow>
              <FeedCollage images={images} />
            </SpacedRow>
          </TouchHandler>
        </RightContainer>
      </Row>

      <ButtonContainer>
        <Button>
          {LikeButton}
          <UserCounter
            style={{marginLeft: 8}}
            countTotal={29}
            avatars={[
              'https://i.pravatar.cc/101',
              'https://i.pravatar.cc/102',
              'https://i.pravatar.cc/103',
              'https://i.pravatar.cc/104',
              'https://i.pravatar.cc/105',
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

export const FeedItem = React.memo(_FeedItem);
