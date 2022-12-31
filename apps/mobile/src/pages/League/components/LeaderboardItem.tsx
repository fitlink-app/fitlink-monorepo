import React from 'react';
import styled, {DefaultTheme} from 'styled-components/native';
import {ViewProps} from 'react-native';
import {Avatar, Icon, Label, LabelProps, TouchHandler} from '@components';
import {widthLize} from "@utils";

export const ITEM_HEIGHT = 82;

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

type WrapperParams = {
  theme: DefaultTheme;
};

const Wrapper = styled(TouchHandler)(({theme}: WrapperParams) => ({
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.separator,
}));

const ContainerRow = styled(Row)({
  height: ITEM_HEIGHT - 1, // subtract margin
  justifyContent: 'space-between',
  paddingRight: 20,
});

const Column = styled.View({
  marginHorizontal: 0,
});

const SelfLine = styled.View({
  width: 9,
  height: 81,
});

const PlaceTextContainer = styled.View({
  width: widthLize(38),
  alignItems: 'flex-start',
  paddingHorizontal: 6,
});

const PlaceText = styled(Label)<LabelProps>({
  fontSize: 17,
  textAlign: 'center',
});

const NameContainer = styled(Row)({
  flexShrink: 1,
  marginRight: 15,
});

const NameText = styled(Label).attrs(() => ({
  bold: true,
}))({
  fontSize: 16,
  marginLeft: 15,
  flexShrink: 1,
});

const PreviousWonsText = styled(Label).attrs(() => ({
  appearance: 'accent',
}))({
  fontSize: 17,
  marginLeft: 10,
});

const PointsText = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  textAlign: 'right',
  fontSize: 15,
});

const CrownIcon = styled(Icon).attrs(({theme}) => ({
  name: 'crown',
  size: 19,
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
  disabled?: boolean;
  onPress?: () => void;
}

export const LeaderboardItem: React.FC<
  LeaderboardItemProps & ViewProps
> = props => {
  const {rank, name, avatarUrl, wins, points, isSelf, onPress, disabled} =
    props;

  return (
    <Wrapper {...{onPress, disabled}}>
      <ContainerRow
        style={{
          backgroundColor: isSelf
            ? '#ECECEC'
            : parseInt(rank) % 2 === 0
            ? '#181818'
            : 'transparent',
          opacity: 0.9,
        }}>
        <Row style={{flexShrink: 1}}>
          <SelfLine
            style={{backgroundColor: isSelf ? '#00E9D7' : 'transparent'}}
          />
          <PlaceTextContainer>
            <PlaceText style={{color: isSelf ? '#060606' : '#FFFFFF'}}>
              {rank}
            </PlaceText>
          </PlaceTextContainer>

          <Avatar url={avatarUrl} size={40} />

          <NameContainer>
            <NameText
              style={{color: isSelf ? '#060606' : '#FFFFFF'}}
              numberOfLines={1}>
              {name}
            </NameText>
            {wins !== 0 && (
              <Row>
                <PreviousWonsText>{wins}</PreviousWonsText>
                <CrownIcon />
              </Row>
            )}
          </NameContainer>
        </Row>

        <Column>
          <PointsText style={{color: isSelf ? '#000000' : '#00E9D7'}}>
            {points}{' '}
            <Label style={{color: isSelf ? '#565656' : '#FFFFFF'}}></Label>
          </PointsText>
        </Column>
      </ContainerRow>
    </Wrapper>
  );
};
