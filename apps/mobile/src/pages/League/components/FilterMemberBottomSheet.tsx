import React, {FC, useEffect, useRef, useState} from 'react';
import {
  BottomSheetModalHandles,
  MenuIcon,
  DynamicBottomSheetModal,
  Checkbox,
} from '@components';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import styled from 'styled-components/native';
import theme from '@theme';

export type SheetOptionValue = 'points' | 'bfit_estimate' | 'wins';

type SheetOption = {
  label: string;
  value: SheetOptionValue;
};

const FILTER_OPTIONS: SheetOption[] = [
  {
    label: 'Points',
    value: 'points',
  },
  {
    label: 'Bfit',
    value: 'bfit_estimate',
  },
  {
    label: 'Wins',
    value: 'wins',
  },
];

type SheetSelectedOption = Record<
  SheetOptionValue,
  {index: number; isSelected: boolean}
>;

const SELECTED_OPTIONS: SheetSelectedOption = {
  bfit_estimate: {index: 0, isSelected: true},
  points: {index: 1, isSelected: false},
  wins: {index: 2, isSelected: false},
};

interface FilterMemberBottomSheetProps {
  isOpen: boolean;
  onApply: (values: SheetOptionValue[]) => void;
}

export const FilterMemberBottomSheet: FC<FilterMemberBottomSheetProps> = ({
  isOpen,
  onApply,
}) => {
  const sheetRef = useRef<BottomSheetModalHandles>(null);

  const [selectedOptions, setSelectedOptions] = useState(SELECTED_OPTIONS);
  const [filterOptions, setFilterOptions] = useState(FILTER_OPTIONS);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedOptions(prev =>
      filterOptions.reduce((nextSelectedOptions, option, index) => {
        return {
          ...nextSelectedOptions,
          [option.value]: {index, isSelected: prev[option.value].isSelected},
        };
      }, prev),
    );
  }, [filterOptions]);

  const onClose = () => {
    // not using reduce on purpose, the purpose is called KISS
    const applyingValues = Object.entries(selectedOptions)
      .filter(([_, val]) => val.isSelected)
      .sort(([_a, a], [_b, b]) => a.index - b.index)
      .map(([key]) => key);

    onApply(applyingValues as SheetOptionValue[]);
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    index,
  }: RenderItemParams<SheetOption>) => {
    return (
      <ScaleDecorator>
        <STouchable
          onLongPress={drag}
          disabled={isActive}
          style={[index !== filterOptions.length - 1 && {marginBottom: 12}]}
        >
          <SItemBody>
            <Checkbox
              checked={selectedOptions[item.value].isSelected}
              onPress={() => {
                setSelectedOptions(prev => ({
                  ...prev,
                  [item.value]: {
                    ...prev[item.value],
                    isSelected: !prev[item.value].isSelected,
                  },
                }));
              }}
            />
            <SItemLabel>{item.label}</SItemLabel>
          </SItemBody>
          <MenuIcon size={24} color={theme.colors.text} />
        </STouchable>
      </ScaleDecorator>
    );
  };

  return (
    <DynamicBottomSheetModal
      ref={sheetRef}
      onClose={onClose}
      title="Filter members"
      headerStyle={{marginHorizontal: 18}}
      backgroundStyle={{backgroundColor: '#161616'}}
      contentContainerStyle={{paddingHorizontal: 0}}
    >
      <DraggableFlatList
        data={filterOptions}
        renderItem={renderItem}
        keyExtractor={item => item.value}
        onDragEnd={({data}) => setFilterOptions(data)}
      />
    </DynamicBottomSheetModal>
  );
};

const SItemLabel = styled.Text({
  fontSize: 12,
  marginLeft: 20,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
  textTransform: 'uppercase',
});

const STouchable = styled.TouchableOpacity({
  height: 60,
  paddingHorizontal: 14,
  paddingVertical: 14,
  backgroundColor: '#565656',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginHorizontal: 18,
});

const SItemBody = styled.View({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
});
