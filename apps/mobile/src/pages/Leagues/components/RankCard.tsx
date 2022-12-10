import React from 'react';
import styled from 'styled-components/native';
import { Card, Label } from '@components';

const Container = styled(Card)({
  width: '100%',
  paddingTop: 23,
  paddingBottom: 20,
  paddingLeft: 33,
  paddingRight: 32,
  marginTop: 16,
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
});

const StatLabel = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 2,
  color: '#565656',
  textTransform: 'uppercase',
});

const PercentageValue = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontSize: 15,
  lineHeight: 18,
  textAlign: 'right',
  letterSpacing: 2,
});

const StatValue = styled(Label).attrs(() => ({
  type: 'title'
}))({
  fontSize: 42,
  lineHeight: 48,
  marginTop: 9,
});

const StatChart = styled.Image({});

export const RankCard = () => {
    return (
        <Container>
            <Row>
                <StatLabel>Total Rank</StatLabel>
                <PercentageValue>+10P</PercentageValue>
            </Row>
            <Row>
                <StatValue>37640</StatValue>
                <StatChart source={require('../../../assets/images/total_rank_chart.png')} />
            </Row>
        </Container>
    );
};