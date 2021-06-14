import {Button} from '@components';
import {useAuth} from '@hooks';
import React from 'react';
import {View} from 'react-native';

export const Feed = () => {
  const {logout} = useAuth();

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Button text="Log out" onPress={() => logout()} />
    </View>
  );
};
