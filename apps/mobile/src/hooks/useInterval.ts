import {useEffect, useRef} from 'react';

/**
 * A hook that implements setInterval in a declarative manner.
 * You can read more details here:
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 */
export const useInterval = (
  callback: () => void,
  delay: number | null,
): void => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
