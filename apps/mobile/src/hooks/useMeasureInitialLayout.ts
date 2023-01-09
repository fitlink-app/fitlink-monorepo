import {useRef} from 'react';
import {LayoutChangeEvent, LayoutRectangle} from 'react-native';

export const useMeasureInitialLayout = () => {
  const initialLayoutReactRef = useRef<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const initialLayoutRef = useRef<LayoutRectangle>(
    initialLayoutReactRef.current,
  );

  const measureInitialLayout = (event: LayoutChangeEvent) => {
    if (initialLayoutRef.current === initialLayoutReactRef.current) {
      initialLayoutRef.current = event.nativeEvent.layout;
    }
  };

  return {initialLayoutRef, measureInitialLayout};
};

export default useMeasureInitialLayout;
