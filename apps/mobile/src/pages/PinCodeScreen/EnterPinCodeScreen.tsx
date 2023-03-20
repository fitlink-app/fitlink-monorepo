import React, {FC} from 'react';
import styled from 'styled-components/native';
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
    navigation.reset({
      index: 0,
      routes: [{name: 'HomeNavigator'}],
    });
  };

  return (
    <SWrapper>
      <PinCodeWrapper
        useBiometry
        title="Enter pin code"
        onSuccess={completeClientAuth}
        forceBiometry={forceBiometry}
      />
    </SWrapper>
  );
};

const SWrapper = styled.SafeAreaView({
  flex: 1,
  paddingHorizontal: 18,
});

export default EnterPinCodeScreen;
