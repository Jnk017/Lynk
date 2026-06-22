import { renderHook, act } from '@testing-library/react-native';
import { useSingleFlight } from './useSingleFlight';

describe('useSingleFlight', () => {
  it('prevents duplicate concurrent operations', async () => {
    const { result } = renderHook(() => useSingleFlight());
    let calls = 0;
    let resolveFirst: (() => void) | undefined;
    const operation = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          calls += 1;
          resolveFirst = resolve;
        }),
    );

    await act(async () => {
      const first = result.current.runOnce(operation);
      const second = result.current.runOnce(operation);
      resolveFirst?.();
      await Promise.all([first, second]);
    });

    expect(calls).toBe(1);
  });
});
