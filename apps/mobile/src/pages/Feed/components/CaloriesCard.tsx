import React from 'react';
import {View} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Card, Label} from '@components';

const Container = styled(Card)({
  alignItems: 'stretch',
  width: '100%',
  paddingTop: 21,
  paddingBottom: 19,
  paddingLeft: 33,
  paddingRight: 27,
  marginTop: 16,
});

const CardLabel = styled(Label).attrs(() => ({
  type: 'caption',
  bold: true,
}))({
  fontSize: 13,
  lineHeight: 15,
  letterSpacing: 2,
  color: '#565656',
  textTransform: 'uppercase',
});

const Value = styled(Label).attrs(() => ({
  type: 'title',
  numberOfNumbers: 5,
}))({
  fontSize: 42,
  lineHeight: 48,
  marginTop: 9,
});

// const CaloriesCircle = styled.View({
//   width: 65,
//   height: 65,
//   borderRadius: 35,
//   background: 'rgba(150, 150, 150, 0.1)',
//   flexDirection: 'row',
//   justifyContent: 'center',
//   alignItems: 'center',
//   textAlign: 'center',
// });

// const Calories = styled(Label).attrs(() => ({
//   type: 'caption',
// }))({
//   fontFamily: 'Roboto',
//   fontStyle: 'normal',
//   fontSize: 18,
//   lineHeight: 21,
//   textAlign: 'center',
//   letterSpacing: 2,
//   textTransform: 'uppercase',
// });

const PercentageValue = styled(Label).attrs(() => ({
  type: 'subheading',
  bold: true,
}))({
  fontSize: 15,
  color: '#565656',
  lineHeight: 18,
  textAlign: 'right',
  letterSpacing: 2,
});

const Row = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const StatChart = styled.Image({});

export const CaloriesCard = () => {
  const {colors} = useTheme();
  return (
    <Container>
      <Row>
        <CardLabel>Total Calories</CardLabel>
        <PercentageValue>+11%</PercentageValue>
      </Row>
      <Row>
        <Row>
          <Value style={{color: colors.grayText}}>0</Value>
          <Value>1240</Value>
        </Row>
        <StatChart
          source={require('../../../assets/images/total_rank_chart2.png')}
        />
      </Row>
      <CardLabel>72.59 POINTS</CardLabel>
    </Container>
  );
  // return (
  //   <Container>
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         justifyContent: 'space-between',
  //         alignItems: 'center',
  //       }}>
  //       <CardLabel>Total Calories</CardLabel>
  //       <PercentageValue>+11%</PercentageValue>
  //     </View>
  //     <View
  //       style={{
  //         flexDirection: 'row',
  //         justifyContent: 'space-between',
  //         alignItems: 'center',
  //       }}>
  //       <View>
  //         <Row>
  //           <Value style={{color: colors.grayText}}>0</Value>
  //           <Value>1240</Value>
  //         </Row>
  //         <CardLabel>$234.12</CardLabel>
  //       </View>
  //       <StatChart
  //         source={require('../../../assets/images/total_rank_chart2.png')}
  //       />
  //     </View>
  //   </Container>
  // );
};
