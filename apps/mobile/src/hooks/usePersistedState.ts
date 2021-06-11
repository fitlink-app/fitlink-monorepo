import AsyncStorage from '@react-native-async-storage/async-storage';
import {Dispatch, SetStateAction, useEffect, useRef, useState} from 'react';

/**
 * Creates a state value similarly to useState,
 * but persists the value between app sessions to AsyncStorage
 *
 * @param initialState
 * @param key Key to persist the data with using AsyncStorage
 * @returns [getter, setter]
 */
export function usePersistedState<S>(
  initialState: S | (() => S),
  key: string,
): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(initialState);
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) {
      setPersistedState(state);
    } else {
      hydrate();
    }
  }, [state]);

  async function hydrate() {
    const persistedState = await getPersistedState();
    if (persistedState) setState(persistedState);

    didMount.current = true;
  }

  async function setPersistedState(state?: S) {
    if (state) {
      await AsyncStorage.setItem(key, JSON.stringify(state));
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  async function getPersistedState() {
    const stateString = await AsyncStorage.getItem(key);
    const state = stateString ? (JSON.parse(stateString) as S) : undefined;

    return state;
  }

  return [state, setState];
}
