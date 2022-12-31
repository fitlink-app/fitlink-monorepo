import React, {useState} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Picker, PickerItemProps} from '@react-native-picker/picker';
import {Icon} from './Icon';
import {TouchHandler} from './TouchHandler';
import {
  StyleProp,
  ViewStyle,
  Platform,
  Modal,
  StyleSheet,
  TextStyle,
} from 'react-native';
import {Label} from '@components';

const Wrapper = styled.View({});

const PickerWrapperIOS = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ModalContent = styled.View({
  flex: 1,
  justifyContent: 'center',
  backgroundColor: 'rgba(0,0,0,0.8)',
});

const PickerSliderCardIOS = styled.View(({theme: {colors}}) => ({
  marginHorizontal: 20,
  borderRadius: 15,
  backgroundColor: colors.background,
  borderWidth: 1,
  borderColor: colors.separator,
}));

const PickerSliderWrapperIOS = styled.View(({theme: {colors}}) => ({
  borderColor: colors.separator,
  borderTopWidth: 1,
  borderBottomWidth: 1,
}));

const PickerModalItemContainer = styled.View({
  padding: 15,
  justifyContent: 'center',
  alignItems: 'center',
});

const AbsoltueFillContainer = styled.View({
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
});

const SelectionIndicator = styled.View(({theme: {colors}}) => ({
  width: '100%',
  height: 44,
  borderColor: colors.separator,
  borderBottomWidth: 1,
  borderTopWidth: 1,
  opacity: 1,
}));

export interface DropdownProps {
  value: any;
  items: Array<PickerItemProps>;
  onValueChange?: (value: any) => void;
  style?: StyleProp<ViewStyle>;
  prompt?: string;
  labelStyle?: StyleProp<TextStyle>;
}

export const Dropdown = (props: DropdownProps) => {
  const {style, value, items, prompt, labelStyle, ...rest} = props;

  const [modalVisible, setModalVisible] = useState(false);

  const {colors} = useTheme();

  if (!items || !(items.length > 0)) return null;

  const renderPicker = () => {
    return (
      <Picker
        {...rest}
        prompt={prompt}
        selectedValue={value}
        style={{color: 'white'}}
        itemStyle={{color: 'white'}}
        dropdownIconColor={'transparent'}>
        {items.map(({label, value}) => (
          <Picker.Item key={label} {...{label, value}} />
        ))}
      </Picker>
    );
  };

  const renderPickerIOS = () => (
    <TouchHandler
      onPress={() => setModalVisible(true)}
      style={{
        height: '100%',
        justifyContent: 'center',
      }}>
      <PickerWrapperIOS>
        <Label appearance={'primary'} type={'subheading'} style={labelStyle}>
          {items.find(x => x.value === value)?.label}
        </Label>

        <Icon
          style={{transform: [{rotateZ: '-90deg'}]}}
          size={14}
          color={'transparent'}
          name={'arrow-left'}
        />
      </PickerWrapperIOS>
    </TouchHandler>
  );

  const renderPickerModalIOS = () => {
    if (Platform.OS !== 'ios') return null;

    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <ModalContent>
          <TouchHandler
            style={{
              flex: 1,
              ...StyleSheet.absoluteFillObject,
            }}
            onPress={() => setModalVisible(false)}
          />
          <PickerSliderCardIOS>
            <PickerModalItemContainer>
              <Label>{prompt}</Label>
            </PickerModalItemContainer>
            <PickerSliderWrapperIOS>
              {renderPicker()}
              <AbsoltueFillContainer pointerEvents={'none'}>
                <SelectionIndicator />
              </AbsoltueFillContainer>
            </PickerSliderWrapperIOS>
            <PickerModalItemContainer>
              <TouchHandler
                onPress={() => setModalVisible(false)}
                style={{
                  width: '100%',
                  alignItems: 'center',
                }}>
                <Label type={'subheading'} appearance={'accent'} bold>
                  OK
                </Label>
              </TouchHandler>
            </PickerModalItemContainer>
          </PickerSliderCardIOS>
        </ModalContent>
      </Modal>
    );
  };

  return (
    <>
      {renderPickerModalIOS()}

      <Wrapper {...{style}}>
        {Platform.OS === 'android' ? renderPicker() : renderPickerIOS()}
      </Wrapper>
    </>
  );
};
