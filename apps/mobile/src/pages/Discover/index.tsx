import React, {useRef} from 'react';
import {StyleSheet} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {BottomSheetModal, BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ActivityDetailsModal, ListModal} from './components';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {useEffect} from 'react';
import styled, {useTheme} from 'styled-components/native';
import {Icon} from '@components';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {
  MapView,
  Camera,
  UserLocation,
  ShapeSource,
  SymbolLayer,
  setAccessToken,
  Images,
  FillLayer,
  CircleLayer,
} = MapboxGL;

const Overlay = styled.View.attrs({
  pointerEvents: 'box-none',
})({
  ...StyleSheet.absoluteFillObject,
});

const IconWrapper = styled.View(({theme: {colors}}) => ({
  backgroundColor: colors.surfaceDark,
  borderRadius: 999,
  padding: 10,
  alignItems: 'center',
  justifyContent: 'center',
}));

const AddActivityButtonContainer = styled.View({
  position: 'absolute',
  top: 0,
  left: 0,
});

const ControlPanel = styled.View({
  position: 'absolute',
  top: 0,
  right: 0,
});

const ControlPanelSeparator = styled.View({height: 10});

export const Discover = () => {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  // ref
  const lastListIndex = useRef(0);
  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;

  // modal ref
  const listModalRef = useRef<BottomSheetModal>(null);
  const detailsModalRef = useRef<BottomSheetModal>(null);
  // const bottomSheetModalCRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    listModalRef.current?.present();
  }, []);

  const handleOnAddActivityPressed = () => {
    // TODO: Implement method
    console.log('Add activity pressed');
  };

  /**
   * Handle pressing an activity on the list or the map
   * @param id activity id
   * @param isMarker whether the activity was pressed on the modal list or by a marker on the map
   */
  const handleOnActivityPressed = (id: string, isMarker?: boolean) => {
    lastListIndex.current = isMarker ? 0 : 1;

    listModalRef.current?.collapse();
    detailsModalRef.current?.present();
  };

  const handleOnDetailsBackPressed = () => {
    detailsModalRef.current?.close();
    listModalRef.current?.snapToIndex(lastListIndex.current);
  };

  const renderAddActivityButton = () => {
    return (
      <AddActivityButtonContainer>
        <IconWrapper>
          <Icon
            onPress={handleOnAddActivityPressed}
            name={'plus'}
            color={colors.accent}
            size={25}
          />
        </IconWrapper>
      </AddActivityButtonContainer>
    );
  };

  const renderControlPanel = () => {
    return (
      <ControlPanel>
        <IconWrapper>
          <Icon
            onPress={handleOnAddActivityPressed}
            name={'location'}
            color={colors.accent}
            size={25}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={handleOnAddActivityPressed}
            name={'search'}
            color={colors.accent}
            size={21}
          />

          <ControlPanelSeparator />

          <Icon
            onPress={handleOnAddActivityPressed}
            name={'my-markers'}
            color={colors.accent}
            size={21}
          />
        </IconWrapper>
      </ControlPanel>
    );
  };

  return (
    <BottomSheetModalProvider>
      <MapView
        regionDidChangeDebounceTime={0}
        style={StyleSheet.absoluteFillObject}
        logoEnabled={false}
        ref={mapViewRef}></MapView>

      <ListModal
        ref={listModalRef}
        onActivityPressed={id => handleOnActivityPressed(id)}
        onExpand={() => {}}
      />

      <ActivityDetailsModal
        ref={detailsModalRef}
        onBack={handleOnDetailsBackPressed}
        stackBehavior={'push'}
      />

      <Overlay style={{top: insets.top, margin: 10}}>
        {renderAddActivityButton()}
        {renderControlPanel()}
      </Overlay>
    </BottomSheetModalProvider>
  );
};
