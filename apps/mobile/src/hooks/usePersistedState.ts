import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useReducer, useRef} from 'react';

type State<S> = {
  data?: S;
  isRestored: boolean;
};

type Action<S> = {type: 'SET_STATE'; payload: {data?: S; merge: boolean}};

enum Actions {
  SetState = 'SET_STATE',
}

const createPersistedReducer =
  <S>() =>
  (state: State<S>, action: Action<S>): State<S> => {
    switch (action.type) {
      case 'SET_STATE':
        const {data, merge} = action.payload;

        return {
          data: merge && state.data ? {...state.data, ...data} : data,
          isRestored: true,
        };
      default:
        throw new Error();
    }
  };

/**
 * Creates a state value similarly to useState,
 * but persists the value between app sessions to AsyncStorage
 *
 * uses useReducer hook internally to avoid multiple state changes on hydration
 *
 * @param initialState
 * @param key Key to persist the data with using AsyncStorage
 * @returns [value, value setter, is restored value]
 */
export function usePersistedState<S>(
  initialState: S,
  key: string,
): [S | undefined, (data: S | undefined) => void, boolean] {
  const [state, dispatch] = useReducer(createPersistedReducer<S>(), {
    ...initialState,
    isRestored: false,
  });

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      hydrate();
      didMount.current = true;
    } else {
      setPersistedState(state.data);
    }
  }, [state.data]);

  async function hydrate() {
    const persistedState = await getPersistedState();
    setState(persistedState);
  }

  function setState(data: S | undefined, merge: boolean = false) {
    dispatch({type: Actions.SetState, payload: {data, merge}});
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

  return [state.data, setState, state.isRestored];
}
