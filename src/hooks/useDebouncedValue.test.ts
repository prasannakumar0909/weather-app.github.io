import { renderHook, act } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial'));
    expect(result.current).toBe('initial');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'first', delay: 400 },
      }
    );

    expect(result.current).toBe('first');

    // Change value
    rerender({ value: 'second', delay: 400 });

    // Should still be 'first' immediately
    expect(result.current).toBe('first');

    // Advance part of the delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    // Advance the rest of the delay
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('second');
  });

  it('should cancel previous timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      {
        initialProps: { value: 'first', delay: 400 },
      }
    );

    expect(result.current).toBe('first');

    // Update 1
    rerender({ value: 'second', delay: 400 });
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Update 2
    rerender({ value: 'third', delay: 400 });
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // It has been 500ms since 'first' changed to 'second', but 'second' was canceled
    // It has been 300ms since 'second' changed to 'third', so 'third' should not be active yet
    expect(result.current).toBe('first');

    act(() => {
      jest.advanceTimersByTime(100);
    });
    // Now it is 400ms since 'third' was requested
    expect(result.current).toBe('third');
  });
});
