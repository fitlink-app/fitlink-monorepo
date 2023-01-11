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

const TotalAmount = ({
  totalAmount,
  totalNumberOfDigits,
}: Pick<PlotCardProps, 'totalAmount' | 'totalNumberOfDigits'>) => {
  const numberOfDigits = String(totalAmount).length;
  const zerosLength =
    totalNumberOfDigits - numberOfDigits > 0
      ? totalNumberOfDigits - numberOfDigits
      : 0;
  const zeros = new Array(zerosLength).fill(0).join('');

  return (
    <Text style={totalAmountStyles.text}>
      {zerosLength && <Text style={totalAmountStyles.zeros}>{zeros}</Text>}
      {totalAmount}
    </Text>
  );
};

const totalAmountStyles = StyleSheet.create({
  text: {
    fontFamily: 'Roboto',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '500',
    color: '#ffffff',
  },
  zeros: {
    color: '#565656',
  },
});

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
        <TotalAmount
          totalAmount={totalAmount}
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

// TODO: provide interface for plot data
const BFIT = ({gainedPerDay, ...rest}: PlotCardWrapperProps) => {
  const Plot = () => (
    <Image source={require('../../../assets/images/total_rank_chart2.png')} />
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
    <Image source={require('../../../../assets/images/wallet_chart2.png')} />
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
