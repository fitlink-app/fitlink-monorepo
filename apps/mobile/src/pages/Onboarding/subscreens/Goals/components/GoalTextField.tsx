import {InputFieldProps, Icon, NumberInputField, Label} from '@components';
import React from 'react';
import styled, {useTheme} from 'styled-components/native';

const Wrapper = styled.View({
  flexDirection: 'row',
});

const StyledLabel = styled(Label)(({theme}) => ({
  fontFamily: theme.fonts.bold,
  fontSize: 22,
  color: 'white',
  flex: 1,
}));

const StyledTextField = styled(NumberInputField)(({theme}) => ({
  fontFamily: theme.fonts.bold,
  color: 'white',
  fontSize: 22,
  width: 90,
  borderBottomWidth: 1,
  borderColor: theme.colors.accent,
  height: 30,
  paddingVertical: 0,
  marginLeft: 7,
  paddingLeft: 4,
}));

const TextFieldWrapper = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
});

interface GoalTextFieldProps extends InputFieldProps {
  label: string;
  icon: string;
}

const _GoalTextField = (props: GoalTextFieldProps) => {
  const {label, value, icon, ...rest} = props;

  const {colors} = useTheme();

  return (
    <Wrapper {...rest}>
      <StyledLabel>{label}</StyledLabel>

      <TextFieldWrapper>
        <Icon name={icon} color={colors.accent} size={30} />
        <StyledTextField
          onChangeText={props.onChangeText}
          maxLength={7}
          placeholderTextColor={colors.secondaryText}
          selectionColor={colors.accent}
          keyboardType={'numeric'}
          returnKeyType={'done'}
          value={value}
        />
      </TextFieldWrapper>
    </Wrapper>
  );
};

const areValuesEqual = (
  prevProps: GoalTextFieldProps,
  nextProps: GoalTextFieldProps,
) => {
  return prevProps.value === nextProps.value;
};

export const GoalTextField = React.memo(_GoalTextField, areValuesEqual);
