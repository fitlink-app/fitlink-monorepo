import React from 'react';
import styled from 'styled-components/native';
import {StyleProp, TextStyle, ViewStyle, View} from 'react-native';
import {Label} from './Label';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

const ChipWrapper = styled.View(({theme}) => ({
  backgroundColor: theme.colors.accentSecondary,
  borderRadius: 999,
  overflow: 'hidden',
}));

const ContentContainer = styled.View({
  paddingVertical: 8,
  paddingHorizontal: 12,
});

const ChipText = styled(Label)({fontSize: 10});

interface ChipProps extends TouchHandlerProps {
  /** Text shown on the chip */
  text: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  progressColor?: string;
  progress?: number;
}

export const Chip = (props: ChipProps) => {
  const {
    text,
    style,
    textStyle,
    progress,
    progressColor = 'white',
    ...rest
  } = props;

  return (
    <TouchHandler {...rest}>
      <ChipWrapper {...{style}}>
        {progress !== undefined && (
          <View
            style={{
              height: '100%',
              width: `${progress * 100}%`,
              position: 'absolute',
              backgroundColor: progressColor,
            }}
          />
        )}
        <ContentContainer>
          <ChipText
            bold
            type="caption"
            appearance={'primary'}
            style={textStyle}>
            {text}
          </ChipText>
        </ContentContainer>
      </ChipWrapper>
    </TouchHandler>
  );
};
