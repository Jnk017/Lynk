import { useCallback, useRef, useState } from 'react';

export function useSingleFlight() {
  const inFlightRef = useRef(false);
  const [isInFlight, setIsInFlight] = useState(false);

  const runOnce = useCallback(async <T>(operation: () => Promise<T>): Promise<T | undefined> => {
    if (inFlightRef.current) {
      return undefined;
    }

    inFlightRef.current = true;
    setIsInFlight(true);

    try {
      return await operation();
    } finally {
      inFlightRef.current = false;
      setIsInFlight(false);
    }
  }, []);

  return { isInFlight, runOnce };
}
