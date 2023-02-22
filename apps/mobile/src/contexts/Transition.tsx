import {Label} from '@components';
import React, {useState, createContext} from 'react';
import {StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {BfitSpinner} from '../components/common/BfitSpinner';

const Wrapper = styled.View({
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0,0,0,0.8)',
  justifyContent: 'center',
  alignItems: 'center',
});

interface TransitionContextProps {
  showTransition: (text: string) => void;
  hideTransition: () => void;
}

export const TransitionContext = createContext({} as TransitionContextProps);

export const Transition: React.FC = ({children}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [text, setText] = useState<string>();

  function showTransition(text: string) {
    setText(text);
    setIsVisible(true);
  }

  const hideTransition = () => {
    setText(undefined);
    setIsVisible(false);
  };

  return (
    <TransitionContext.Provider value={{showTransition, hideTransition}}>
      {children}
      {isVisible && (
        <Wrapper>
          <BfitSpinner wrapperStyle={{marginBottom: 10}} />
          <Label appearance={'primary'}>{text}</Label>
        </Wrapper>
      )}
    </TransitionContext.Provider>
  );
};
