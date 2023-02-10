import {useRef, useState} from 'react';
import {LayoutChangeEvent, LayoutRectangle} from 'react-native';

export const useMeasureInitialLayout = () => {
  const [initialLayout, setInitialLayout] = useState<LayoutRectangle>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const isMeasuredRef = useRef(false);

  const measureInitialLayout = (event: LayoutChangeEvent) => {
    if (!isMeasuredRef.current) {
      setInitialLayout(event.nativeEvent.layout);
    }
  };

  return {initialLayout, measureInitialLayout};
};

export default useMeasureInitialLayout;
