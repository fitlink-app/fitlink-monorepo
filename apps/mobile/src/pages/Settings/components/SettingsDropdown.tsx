import {Dropdown, DropdownProps} from '@components';
import React from 'react';
import {View, Platform} from 'react-native';
import styled from 'styled-components/native';
import {SettingsItemLabel} from './SettingsItemLabel';
import {SettingsItemWrapper} from './SettingsItemWrapper';

const ContainerRow = styled.View({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 15,
});

const StyledLabel = styled(SettingsItemLabel)({
  paddingRight: 20,
});

interface SettingsDropdownProps extends DropdownProps {
  /** Display label of this button */
  label: string;
}

export const SettingsDropdown = (props: SettingsDropdownProps) => {
  const {label, ...rest} = props;

  return (
    <>
      <SettingsItemWrapper style={{height: 50, borderTopWidth: 1, borderColor: '#2e2e2e'}}>
        <ContainerRow>
          <StyledLabel children={label} />
          <View style={Platform.OS === 'android' ? {width: 140} : {flex: 1}}>
            <Dropdown
              {...{label, ...rest}}
              labelStyle={{
                textAlign: 'right',
                flex: 1,
                marginRight: 15,
              }}
            />
          </View>
        </ContainerRow>
      </SettingsItemWrapper>
    </>
  );
};
