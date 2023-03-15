import React, {FC} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';

import {RootStackParamList} from '@routes';
import {PinCodeWrapper} from '@components';
import {grantClientSideAccess, resetPinErrorCount} from '../../redux/auth';
import {useAppDispatch} from '../../redux/store';

type RouteType = RouteProp<RootStackParamList, 'EnterPinCodeScreen'>;
type NavigationType = StackNavigationProp<
  RootStackParamList,
  'EnterPinCodeScreen'
>;

export const EnterPinCodeScreen: FC = () => {
  const {forceBiometry = false} = useRoute<RouteType>().params ?? {};
  const navigation = useNavigation<NavigationType>();

  const dispatch = useAppDispatch();

  const completeClientAuth = () => {
    dispatch(grantClientSideAccess());
    dispatch(resetPinErrorCount());
    // TODO: consider replacement
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeNavigator'}],
    });
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <PinCodeWrapper
        useBiometry
        title="Enter pin code"
        onSuccess={completeClientAuth}
        forceBiometry={forceBiometry}
      />
    </SafeAreaView>
  );
};

export default EnterPinCodeScreen;
