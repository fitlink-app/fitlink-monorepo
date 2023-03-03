import {useState} from 'react';
import {LayoutChangeEvent, LayoutRectangle} from 'react-native';

export const useMeasureLayout = () => {
  const [layout, setLayout] = useState<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const measureLayout = ({nativeEvent}: LayoutChangeEvent) => {
    if (nativeEvent) {
      setLayout({...nativeEvent.layout});
    }
  };

  return {measureLayout, layout};
};

export default useMeasureLayout;
