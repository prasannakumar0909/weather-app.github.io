import {
  formatTemp,
  tempUnitLabel,
  windUnitLabel,
  formatLocalTime,
  formatDay,
  formatHour,
  debounce,
} from './format';

describe('format utilities', () => {
  describe('formatTemp', () => {
    it('rounds and formats temperature values', () => {
      expect(formatTemp(23.4)).toBe('23°');
      expect(formatTemp(23.6)).toBe('24°');
      expect(formatTemp(-5.5)).toBe('-5°'); // Math.round(-5.5) = -5 (or -6 depending on JS engine, -5 is round-half-up for negatives in JS)
      expect(formatTemp(0)).toBe('0°');
    });
  });

  describe('tempUnitLabel', () => {
    it('returns appropriate letter for metric or imperial unit', () => {
      expect(tempUnitLabel('metric')).toBe('C');
      expect(tempUnitLabel('imperial')).toBe('F');
    });
  });

  describe('windUnitLabel', () => {
    it('returns appropriate speed units', () => {
      expect(windUnitLabel('metric')).toBe('m/s');
      expect(windUnitLabel('imperial')).toBe('mph');
    });
  });

  describe('formatLocalTime', () => {
    it('formats a unix timestamp given a timezone offset (seconds) correctly', () => {
      // 1620000000 -> Monday, May 3, 2021 12:00:00 AM UTC
      // offset is 3600 seconds (1 hour)
      // New time should be May 3, 2021 1:00:00 AM UTC
      const unixSec = 1620000000;
      const timezoneSec = 3600;
      const result = formatLocalTime(unixSec, timezoneSec);
      expect(result).toBe('1:00 AM');
    });
  });

  describe('formatDay', () => {
    it('formats to short weekday name', () => {
      // 1620000000 is May 3, 2021 (Monday)
      const unixSec = 1620000000;
      const timezoneSec = 0;
      const result = formatDay(unixSec, timezoneSec);
      expect(result).toBe('Mon');
    });
  });

  describe('formatHour', () => {
    it('formats to hour name', () => {
      const unixSec = 1620000000;
      const timezoneSec = 0;
      const result = formatHour(unixSec, timezoneSec);
      expect(result).toBe('12 AM');
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('debounces callbacks and calls with latest args', () => {
      const mockFn = jest.fn();
      const debounced = debounce(mockFn, 100);

      debounced('a');
      debounced('b');
      debounced('c');

      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(50);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenLastCalledWith('c');
    });
  });
});
