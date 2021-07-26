import React from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';
import {FormTitle} from '.';
import {Dropdown, DropdownProps} from '../common/Dropdown';

const ContentContainer = styled.View(({theme: {colors}}) => ({
  borderBottomWidth: 1,
  borderColor: colors.accentSecondary,
  height: 44,
  justifyContent: 'center',
}));

interface FormDropdownProps extends DropdownProps {
  label: string;
}

export const FormDropdown = ({label, style, ...rest}: FormDropdownProps) => (
  <View {...{style}}>
    <FormTitle style={{alignSelf: 'flex-start'}}>{label}</FormTitle>
    <ContentContainer>
      <Dropdown {...rest} />
    </ContentContainer>
  </View>
);
