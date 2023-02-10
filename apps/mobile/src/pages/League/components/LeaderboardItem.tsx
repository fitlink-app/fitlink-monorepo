import React from 'react';
import styled from 'styled-components/native';
import {Avatar, Icon, Label, LabelProps, TouchHandler} from '@components';
import theme from '../../../theme/themes/fitlink';

export const ITEM_HEIGHT = 82;

const Row = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

const ContainerRow = styled(Row)({
  height: ITEM_HEIGHT,
  justifyContent: 'space-between',
  paddingRight: 20,
  paddingLeft: 20,
});

const SelfLine = styled.View({
  position: 'absolute',
  backgroundColor: '#00E9D7',
  width: 2,
  height: ITEM_HEIGHT,
});

const SelfTriangle = styled.View({
  position: 'absolute',
  width: 0,
  height: 0,
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderTopWidth: 5,
  borderBottomWidth: 5,
  borderLeftWidth: 8,
  borderTopColor: 'transparent',
  borderRightColor: 'transparent',
  borderBottomColor: 'transparent',
  borderLeftColor: '#00E9D7',
});

const PlaceText = styled(Label)<LabelProps>({
  color: '#fff',
  fontSize: 17,
  textAlign: 'center',
  marginRight: 17,
});

const ShrunkContainer = styled(Row)({
  flexShrink: 1,
  marginRight: 15,
});

const NameText = styled(Label).attrs(() => ({
  bold: true,
}))({
  color: '#fff',
  fontSize: 16,
  marginLeft: 15,
  flexShrink: 1,
});

const WinsNumber = styled(Label).attrs(() => ({
  appearance: 'accent',
}))({
  fontSize: 17,
  marginLeft: 10,
  fontFamily: theme.fonts.regular,
});

const PointsText = styled(Label).attrs(() => ({
  type: 'caption',
}))({
  color: '#00E9D7',
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

const ShrunkRow = styled(Row)({
  flexShrink: 1,
});

const SelfIndicator = () => (
  <>
    <SelfLine />
    <SelfTriangle />
  </>
);

const Wins = ({wins}: {wins: number}) => (
  <Row>
    <WinsNumber>{wins}</WinsNumber>
    <CrownIcon />
  </Row>
);

interface LeaderboardItemProps {
  rank: string;
  name: string;
  avatarUrl?: string;
  wins: number;
  points: number;
  isSelf: boolean;
  onPress?: () => void;
  isBfit?: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  rank,
  name,
  avatarUrl,
  points,
  isSelf,
  onPress,
  isBfit = false,
  wins,
}) => {
  const rowBackgroundColor =
    parseInt(rank) % 2 === 1 ? theme.colors.background : theme.colors.card;

  return (
    <TouchHandler onPress={onPress} disabled={isSelf}>
      <ContainerRow style={{backgroundColor: rowBackgroundColor}}>
        {isSelf && <SelfIndicator />}
        <ShrunkRow>
          <PlaceText>{rank}</PlaceText>
          <Avatar url={avatarUrl} size={40} />
          <ShrunkContainer>
            <NameText numberOfLines={1}>{name}</NameText>
            {wins !== 0 && <Wins wins={wins} />}
          </ShrunkContainer>
        </ShrunkRow>

        <PointsText>
          {points}
          {isBfit && (
            <>
              &nbsp;<Label>BFIT</Label>
            </>
          )}
        </PointsText>
      </ContainerRow>
    </TouchHandler>
  );
};
