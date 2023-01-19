import React from 'react';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  Text,
  Image,
} from 'react-native';
import PaddedNumber from '../numbers/PaddedNumber';
import {WeeklyEarningsGraph} from '@components';

interface PlotCardProps {
  title: string;
  subtitle: string;
  totalAmount: number;
  percentsPerDay: number;
  onPress?: () => unknown;
  Plot: React.ReactElement;
  totalNumberOfDigits: number;
  wrapperStyle?: StyleProp<ViewStyle>;
}

const PlotCard = ({
  Plot,
  title,
  onPress,
  subtitle,
  totalAmount,
  wrapperStyle,
  percentsPerDay,
  totalNumberOfDigits,
}: PlotCardProps): JSX.Element => {
  const gain = `${percentsPerDay} %`;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.wrapper, wrapperStyle]}>
      <View>
        <Text style={styles.text}>{title}</Text>
        <PaddedNumber
          amount={totalAmount}
          totalNumberOfDigits={totalNumberOfDigits}
        />
        <Text style={styles.text}>{subtitle}</Text>
      </View>
      <View style={styles.rightCol}>
        <Text style={[styles.text, styles.selfEnd]}>{gain}</Text>
        <View style={styles.plotWrapper}>{Plot}</View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    height: 120,
    paddingVertical: 22,
    paddingHorizontal: 32,
    backgroundColor: '#161616',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  plotWrapper: {
    height: 50,
  },
  rightCol: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 15,
    lineHeight: 17,
    fontWeight: '500',
    color: '#565656',
  },
  selfEnd: {
    alignSelf: 'flex-end',
  },
});

interface PlotCardWrapperProps
  extends Omit<
    PlotCardProps,
    'totalNumberOfDigits' | 'Plot' | 'title' | 'subtitle'
  > {
  gainedPerDay: number;
}

const BFIT = ({gainedPerDay, ...rest}: PlotCardWrapperProps) => {
  const Plot = () => (
    <WeeklyEarningsGraph height={50} barWidth={4} gapWidth={18} />
  );

  return (
    <PlotCard
      {...rest}
      title="TOTAL $BFIT"
      subtitle={`$${gainedPerDay}`}
      totalNumberOfDigits={5}
      Plot={<Plot />}
    />
  );
};

const Calories = ({gainedPerDay, ...rest}: PlotCardWrapperProps) => {
  const Plot = () => (
    <Image source={require('../../../assets/images/total_rank_chart2.png')} />
  );

  return (
    <PlotCard
      {...rest}
      title="TOTAL CALORIES"
      subtitle={`${gainedPerDay} POINTS`}
      totalNumberOfDigits={6}
      Plot={<Plot />}
    />
  );
};

export default {BFIT, Calories};
