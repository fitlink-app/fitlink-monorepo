import React from 'react';
import styled from 'styled-components/native';
import {ViewProps} from 'react-native';

const Wrapper = styled.View({
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'center',
});

type DotParameters = {
  selected: boolean;
  size?: number;
};

const Dot = styled.View((params: DotParameters) => {
  const {selected, size = 8} = params;

  return {
    height: size,
    width: size,
    borderRadius: size / 2,
    backgroundColor: `rgba(255,255,255,${selected ? 1 : 0.2})`,
    marginHorizontal: size / 2,
  };
});

interface DotsProps {
  /** Amount of dots displayed */
  amount: number;

  /** Index of the highlihted dot */
  current: number;

  /** Size of individual dots*/
  size?: number;
}

export const Dots: React.FC<DotsProps & ViewProps> = ({
  amount,
  current,
  size,
  ...rest
}) => {
  function renderDots() {
    const dots = [];
    for (let i = 0; i < amount; i++) {
      dots.push(
        <Dot key={i.toString()} {...{size}} selected={i === current} />,
      );
    }

    return dots;
  }

  return <Wrapper {...rest}>{renderDots()}</Wrapper>;
};
