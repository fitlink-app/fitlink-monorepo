import React from 'react';
import {Animated, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button, Card, Label} from '../../components';
import styled, {useTheme} from 'styled-components/native';

type DialogButton = {
  label: string;
  onPress: () => any;
  closeWithoutAnimation?: boolean;
};

// ---------- Styled Components --------- //
const Wrapper = styled.View.attrs(() => ({
  pointerEvents: 'box-none',
}))({
  ...StyleSheet.absoluteFillObject,
});

const ContentContainer = styled(Animated.View).attrs(() => ({
  pointerEvents: 'box-none',
}))({
  flex: 1,
  width: '100%',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

const ContentContainerCard = styled(Card)({
  width: '100%',
  paddingTop: 10,
  marginBottom: -100,
  paddingBottom: 110,
  alignItems: 'center',
});

const HorizontalSpacer = styled.View({
  width: '100%',
  paddingHorizontal: 40,
});

const VerticalSpacer = styled.View({
  paddingVertical: 10,
});

const CancelButton = styled(Button).attrs(() => ({
  containerStyle: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
  },
  textStyle: {
    color: 'white',
  },
}))({
  width: '100%',
});

interface DialogProps {
  /** Callback to be invoked when the dialog is closed internally, pass closeModal(id) method here*/
  onCloseCallback: () => void;
  /** Title of the dialog */
  title: string;

  /** Cancel button's label, defaults to 'Cancel' */
  cancelButtonLabel?: string;

  /** Array of DialogButton */
  buttons: DialogButton[];

  hideCancelButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  onCloseCallback,
  title,
  cancelButtonLabel,
  buttons,
  hideCancelButton,
}) => {
  const insets = useSafeAreaInsets();

  function handleDialogButtonPress(callback?: () => void) {
    onCloseCallback();
    typeof callback === 'function' && callback();
  }

  function renderButtons() {
    return buttons.map((button, index) => (
      <Button
        key={button.label + index}
        style={{marginBottom: index === buttons.length - 1 ? 0 : 5}}
        text={button.label}
        onPress={() => handleDialogButtonPress(button.onPress)}
      />
    ));
  }

  function renderCancelButton(label?: string) {
    return (
      <CancelButton
        onPress={() => handleDialogButtonPress()}
        text={label || 'Cancel'}
      />
    );
  }

  return (
    <Wrapper>
      <ContentContainer
        style={{
          paddingBottom: insets.bottom,
        }}>
        <ContentContainerCard>
          <VerticalSpacer>
            <Label appearance={'primary'} type={'title'} bold>
              {title}
            </Label>
          </VerticalSpacer>

          <HorizontalSpacer>
            <VerticalSpacer>{renderButtons()}</VerticalSpacer>

            {!hideCancelButton && (
              <VerticalSpacer>
                {renderCancelButton(cancelButtonLabel)}
              </VerticalSpacer>
            )}
          </HorizontalSpacer>
        </ContentContainerCard>
      </ContentContainer>
    </Wrapper>
  );
};