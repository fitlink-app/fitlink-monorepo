import {TouchHandler} from '@components';
import React, {createContext, Fragment, useRef, useState} from 'react';
import {useEffect} from 'react';
import {Animated, Dimensions, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {v4 as uuidv4} from 'uuid';

if (__DEV__ && typeof global.crypto !== 'object') {
  global.crypto = {
    //@ts-ignore
    getRandomValues: (array: any[]) =>
      array.map(() => Math.floor(Math.random() * 256)),
  };
}

const {height: screenHeight} = Dimensions.get('screen');

const AnimatedContainer = styled(Animated.View).attrs({
  pointerEvents: 'box-none',
})({
  ...StyleSheet.absoluteFillObject,
});

const ModalWrapper = styled.View.attrs({pointerEvents: 'box-none'})({
  ...StyleSheet.absoluteFillObject,
  alignItems: 'center',
  justifyContent: 'center',
});

const Backdrop = styled(TouchHandler).attrs({activeOpacity: 1})({
  ...StyleSheet.absoluteFillObject,
});

const BackdropAnimatedBackground = styled(Animated.View)({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.75)',
});

type ModalComponent = {
  id: string;
  component: JSX.Element;
  onCloseCallback?: () => void;
};

interface ModalContextType {
  openModal: (
    content: (componentId: string) => JSX.Element,
    onCloseCallback?: () => void,
  ) => string;
  closeModal: (id: string, callback?: () => void) => void;
}

export const ModalContext = createContext<ModalContextType>(
  {} as ModalContextType,
);

export const ModalProvider: React.FC = ({children}) => {
  const [components, setComponents] = useState<ModalComponent[]>([]);

  /** Animated values */
  const opacity = useRef(new Animated.Value(0)).current;
  const contentTransformY = useRef(new Animated.Value(0)).current;

  function animateOpen() {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 125,
      useNativeDriver: true,
    }).start(() => {});

    Animated.spring(contentTransformY, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  function animateClose(callback?: () => void) {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 125,
      useNativeDriver: true,
    }).start(() => {
      if (callback) callback();
    });

    Animated.spring(contentTransformY, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  }

  useEffect(() => {
    if (components.length) animateOpen();
  }, [components]);

  function openModal(
    content: (componentId: string) => JSX.Element,
    onCloseCallback?: () => void,
  ) {
    const componentId = uuidv4();

    const wrappedComponent = (
      <ModalWrapper>{content(componentId)}</ModalWrapper>
    );
    const newModalComponent: ModalComponent = {
      id: componentId,
      component: wrappedComponent,
      onCloseCallback,
    };

    setComponents(prevComponents => [newModalComponent, ...prevComponents]);

    return componentId;
  }

  function closeModal(id: string, callback?: () => void) {
    const selectedComponent = components.find(component => component.id === id);
    const newComponents = components.filter(component => component.id !== id);

    animateClose(() => {
      selectedComponent?.onCloseCallback && selectedComponent.onCloseCallback();
      setComponents(newComponents);
      callback && callback();
    });
  }

  function closeTopModal() {
    closeModal(components[components.length - 1].id);
  }

  const renderComponents = components.map((modalComponent, index) => (
    <Fragment key={modalComponent.id + index}>
      {modalComponent.component}
    </Fragment>
  ));

  const animatedStyle = {
    transform: [
      {
        translateY: contentTransformY.interpolate({
          inputRange: [0, 1],
          outputRange: [screenHeight, 0],
        }),
      },
    ],
  };

  const contextValue = {openModal, closeModal};

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      {!!components.length && (
        <>
          <Backdrop onPress={() => closeTopModal()}>
            <BackdropAnimatedBackground style={{opacity}} />
          </Backdrop>

          <AnimatedContainer style={animatedStyle}>
            {renderComponents}
          </AnimatedContainer>
        </>
      )}
    </ModalContext.Provider>
  );
};
