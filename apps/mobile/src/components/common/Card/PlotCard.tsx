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
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import {WeeklyEarningsGraph} from '@components';
import {useWeeklyEarnings} from '@hooks';

interface PlotCardProps {
  title: string;
  subtitle: string;
  totalAmount: number;
  isLoading?: boolean;
  percentsGrowth: number;
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
  isLoading,
  totalAmount,
  wrapperStyle,
  percentsGrowth,
}: PlotCardProps): JSX.Element => {
  const gain = `${percentsGrowth} %`;
  return (
    <TouchableOpacity onPress={onPress} style={wrapperStyle}>
      {isLoading ? (
        <SkeletonPlaceholder highlightColor="#565656" backgroundColor="#161616">
          <View style={styles.wrapper} />
        </SkeletonPlaceholder>
      ) : (
        <View style={styles.wrapper}>
          <View>
            <Text style={styles.text}>{title}</Text>
            <Text style={styles.bfitText}>{Math.trunc(totalAmount)}</Text>
            <Text style={styles.text}>{subtitle}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={[styles.text, styles.selfEnd]}>{gain}</Text>
            <View style={styles.plotWrapper}>{Plot}</View>
          </View>
        </View>
      )}
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
  bfitText: {
    fontFamily: 'Roboto',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '500',
    color: '#ffffff',
  },
});

interface PlotCardWrapperProps
  extends Omit<
    PlotCardProps,
    'totalNumberOfDigits' | 'Plot' | 'title' | 'subtitle' | 'percentsGrowth'
  > {
  totalAmountAlt: number;
}

const BFITInner = ({totalAmountAlt, ...rest}: PlotCardWrapperProps) => {
  const {weeklyEarnings, percentsGrowth} = useWeeklyEarnings();

  const Plot = () => (
    <WeeklyEarningsGraph
      height={50}
      barWidth={4}
      gapWidth={18}
      weeklyEarnings={weeklyEarnings}
    />
  );

  return (
    <PlotCard
      {...rest}
      percentsGrowth={percentsGrowth}
      title="TOTAL BFIT"
      subtitle={`$${totalAmountAlt}`}
      totalNumberOfDigits={5}
      Plot={<Plot />}
    />
  );
};

const Calories = ({totalAmountAlt, ...rest}: PlotCardWrapperProps) => {
  const Plot = () => (
    <Image source={require('../../../assets/images/total_rank_chart2.png')} />
  );

  return (
    <PlotCard
      {...rest}
      percentsGrowth={20}
      title="TOTAL CALORIES"
      subtitle={`${totalAmountAlt} POINTS`}
      totalNumberOfDigits={6}
      Plot={<Plot />}
    />
  );
};

export default {BFIT: React.memo(BFITInner), Calories};
