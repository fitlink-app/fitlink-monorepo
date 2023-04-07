import React, {
  useMemo,
  forwardRef,
  PropsWithChildren,
  ForwardRefRenderFunction,
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
} from 'react';
import {
  View,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Text,
} from 'react-native';
import {
  BottomSheetModalProps,
  BottomSheetModal as GorhomBottomSheetModal,
  useBottomSheetDynamicSnapPoints,
  BottomSheetView,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import theme from '@theme';

import CloseLineIcon from '../icons/CloseLineIcon';

export type BottomSheetModalHandles = GorhomBottomSheetModal;

interface IBottomSheetProps extends Omit<BottomSheetModalProps, 'snapPoints'> {
  title?: string;
  onClose?: () => void;
  headerStyle?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

const DynamicBottomSheetModalBase: ForwardRefRenderFunction<
  GorhomBottomSheetModal,
  PropsWithChildren<IBottomSheetProps>
> = (
  {
    title,
    headerStyle,
    handleIndicatorStyle,
    backgroundStyle,
    contentContainerStyle,
    onClose,
    onDismiss,
    onChange,
    children,
    ...props
  },
  forwardedRef,
) => {
  const bottomSheetRef = useRef<BottomSheetModalHandles>(null);

  const insets = useSafeAreaInsets();

  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  const {
    animatedHandleHeight,
    animatedSnapPoints,
    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints);

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <Animated.View {...backdropProps}>
        <View style={styles.backdrop} />
      </Animated.View>
    ),
    [],
  );

  useImperativeHandle(forwardedRef, () => ({
    // sheet
    snapToIndex: (...args) => bottomSheetRef.current?.snapToIndex(...args),
    snapToPosition: (...args) =>
      bottomSheetRef.current?.snapToPosition(...args),
    expand: animationConfigs =>
      bottomSheetRef.current?.expand(animationConfigs),
    collapse: animationConfigs =>
      bottomSheetRef.current?.collapse(animationConfigs),
    close: animationConfigs => bottomSheetRef.current?.close(animationConfigs),
    forceClose: animationConfigs =>
      bottomSheetRef.current?.forceClose(animationConfigs),
    // modal methods
    dismiss: animationConfigs => {
      onDismiss?.();
      bottomSheetRef.current?.dismiss(animationConfigs);
    },
    present: () => bottomSheetRef.current?.present(),
  }));

  return (
    <GorhomBottomSheetModal
      {...props}
      ref={bottomSheetRef}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      handleIndicatorStyle={[styles.handleIndicatorStyle, handleIndicatorStyle]}
      backgroundStyle={[styles.backgroundStyle, backgroundStyle]}
      backdropComponent={renderBackdrop}
      onChange={index => {
        if (index === -1) {
          onClose?.();
        }
        onChange?.(index);
      }}
    >
      <BottomSheetView
        style={[
          styles.contentContainer,
          contentContainerStyle,
          {paddingBottom: insets.bottom + 20},
        ]}
        onLayout={handleContentLayout}
      >
        {Boolean(title) && (
          <View style={[styles.header, headerStyle]}>
            <Text style={{color: theme.colors.text}}>{title}</Text>
            <TouchableOpacity
              onPress={() => {
                onDismiss?.();
                bottomSheetRef.current?.dismiss();
              }}
              style={styles.closeWrapper}
            >
              <CloseLineIcon size={24} />
            </TouchableOpacity>
          </View>
        )}
        {children}
      </BottomSheetView>
    </GorhomBottomSheetModal>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
  },
  handleIndicatorStyle: {
    borderRadius: 3,
    backgroundColor: theme.colors.secondaryText,
    width: 60,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: 18,
    marginBottom: 18,
  },
  closeWrapper: {
    position: 'absolute',
    right: 0,
    top: 18,
  },
  contentContainer: {
    paddingHorizontal: 18,
  },
});

export const DynamicBottomSheetModal = memo(
  forwardRef(DynamicBottomSheetModalBase),
);

export default DynamicBottomSheetModal;
