import React, {useRef} from 'react';
import {StyleSheet} from 'react-native';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {ListModal} from './components';
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

const Overlay = styled.View({
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
  const mapViewRef = useRef() as React.MutableRefObject<MapboxGL.MapView>;

  const listModalRef = useRef<BottomSheetModalMethods>(null);

  useEffect(() => {
    listModalRef.current?.present();
  }, []);

  const handleOnAddActivityPressed = () => {
    // TODO: Implement method
    console.log('Add activity pressed');
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
        onActivityPressed={() => {}}
        onExpand={() => {}}
      />

      <Overlay style={{top: insets.top, margin: 10}}>
        {renderAddActivityButton()}
        {renderControlPanel()}
      </Overlay>
    </BottomSheetModalProvider>
  );
};
