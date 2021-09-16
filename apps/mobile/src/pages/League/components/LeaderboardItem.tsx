import React from 'react';
import styled, {DefaultTheme} from 'styled-components/native';
import {ViewProps} from 'react-native';
import {Avatar, Icon, Label, LabelProps, TouchHandler} from '@components';

export const ITEM_HEIGHT = 41;

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

type WrapperParams = {
  theme: DefaultTheme;
  renderBorder: boolean;
};

const Wrapper = styled(TouchHandler)(
  ({theme, renderBorder}: WrapperParams) => ({
    borderBottomWidth: renderBorder ? 1 : 0,
    borderBottomColor: theme.colors.separator,
    marginHorizontal: 20,
  }),
);

const ContainerRow = styled(Row)({
  height: ITEM_HEIGHT - 1, // subtract margin
  justifyContent: 'space-between',
});

const Column = styled.View({
  marginHorizontal: 2,
});

const PlaceTextContainer = styled.View({
  width: 28,
  alignItems: 'flex-start',
});

const PlaceText = styled(Label)<LabelProps>({
  fontSize: 10,
  textAlign: 'center',
  width: 18,
});

const NameContainer = styled(Row)({
  flexShrink: 1,
  marginRight: 15,
});

const NameText = styled(Label)({
  marginLeft: 8,
  flexShrink: 1,
});

const PreviousWonsText = styled(Label).attrs(() => ({
  type: 'caption',
  appearance: 'accent',
  bold: true,
}))({
  marginLeft: 4,
});

const PointsText = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  textAlign: 'right',
});

const CrownIcon = styled(Icon).attrs(({theme}) => ({
  name: 'crown',
  size: 14,
  color: theme.colors.accent,
}))({
  marginLeft: 8,
});

interface LeaderboardItemProps {
  rank: string;
  name: string;
  avatarUrl?: string;
  wins: number;
  points: number;
  isSelf: boolean;
  isLast: boolean;
  onPress?: () => void;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps & ViewProps> =
  props => {
    const {rank, name, avatarUrl, wins, points, isSelf, isLast, onPress} =
      props;

    return (
      <Wrapper {...{onPress}} renderBorder={!isLast}>
        <ContainerRow>
          <Row style={{flexShrink: 1}}>
            <PlaceTextContainer>
              <PlaceText appearance={isSelf ? 'accent' : undefined}>
                {rank}
              </PlaceText>
            </PlaceTextContainer>

            <Avatar url={avatarUrl} size={28} />

            <NameContainer>
              <NameText
                appearance={isSelf ? 'accent' : 'primary'}
                numberOfLines={1}>
                {name}
              </NameText>
              {wins !== 0 && (
                <Row>
                  <CrownIcon />
                  <PreviousWonsText>{wins}</PreviousWonsText>
                </Row>
              )}
            </NameContainer>
          </Row>

          <Column>
            <PointsText
              appearance={
                isSelf ? 'accent' : rank === '1' ? 'primary' : undefined
              }>
              {points}
            </PointsText>
          </Column>
        </ContainerRow>
      </Wrapper>
    );
  };
