import React, {useEffect, useRef} from 'react';
import {Dimensions, ScrollView, View, StyleSheet} from 'react-native';
import styled, {useTheme} from 'styled-components/native';
import {Label} from '@components';
import LinearGradient from 'react-native-linear-gradient';

const CarouselContainer = styled.View({
  flexDirection: 'row',
  width: '100%',
});

// TODO: Figma has 473 height size, fix: change "absolute" to "relative" layout
const CarouselItem = styled.View({
  height: 410,
});

const SBottomView = styled.View({
  position: 'absolute',
  right: 23,
  bottom: 23,
  alignItems: 'flex-end',
});

const SDotView = styled.View({
  flexDirection: 'row',
  marginTop: 40,
});

const SBackgroundImage = styled.Image({
  position: 'absolute',
  width: '100%',
  height: '100%',
});

const SBackgroundOverlay = styled(LinearGradient).attrs(() => ({
  start: {x: 1, y: 0},
  end: {x: 0, y: 0},
  colors: ['rgba(6, 6, 6, 0.85)', 'rgba(6, 6, 6, 0)'],
}))({
  ...StyleSheet.absoluteFillObject,
  opacity: 0.9,
});

const SFitnessName = styled(Label).attrs(() => ({
  type: 'title',
  bold: true,
  numberOfLines: 2,
}))({
  textAlign: 'right',
  fontSize: 40,
});

const width = Dimensions.get('window').width;
const delay = 5000;

interface ActivityCarouselProps {
  images: string[];
  title: string;
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
}

export const ActivityCarousel = ({
  images,
  title,
  selectedIndex,
  setSelectedIndex,
  children,
}: ActivityCarouselProps) => {
  const {colors} = useTheme();
  const scrollView = useRef<ScrollView>(null);

  // Script which will only executed when component initilizes
  useEffect(() => {
    const fn = setInterval(() => {
      setSelectedIndex((oldCount: Number) =>
        oldCount === images.length - 1 ? 0 : Number(oldCount) + 1,
      );
    }, delay);
    return () => {
      clearInterval(fn);
    };
  }, [images.length, setSelectedIndex]);

  // Script will executed every time selectedIndex updates
  useEffect(() => {
    scrollView?.current?.scrollTo({
      animated: true,
      x: width * Number(selectedIndex),
      y: 0,
    });
  }, [selectedIndex]);

  const setIndex = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const viewSize = event.nativeEvent.layoutMeasurement;

    // Divide the horizontal offset by the width of the view to see which page is visible
    setSelectedIndex(Math.floor(contentOffset.x / viewSize.width));
  };

  return (
    <View>
      <ScrollView
        ref={scrollView}
        horizontal
        pagingEnabled
        onMomentumScrollEnd={setIndex}
        onContentSizeChange={() => scrollView?.current?.scrollToEnd()}>
        <CarouselContainer>
          {images.map(item => (
            <CarouselItem style={{width}}>
              <SBackgroundImage source={{uri: item}} />
            </CarouselItem>
          ))}
        </CarouselContainer>
      </ScrollView>
      <SBackgroundOverlay />
      {children}
      <SBottomView>
        <SFitnessName>{title}</SFitnessName>
        {images.length > 1 ? (
          <SDotView>
            {images.map((_, index) => (
              <View
                style={{
                  width: 9,
                  height: 9,
                  backgroundColor:
                    index === selectedIndex
                      ? colors.accent
                      : 'rgba(255, 255, 255, 0.4)',
                  borderRadius: 5,
                  marginLeft: 7,
                }}
              />
            ))}
          </SDotView>
        ) : null}
      </SBottomView>
    </View>
  );
};
