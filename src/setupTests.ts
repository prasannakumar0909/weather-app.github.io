import '@testing-library/jest-dom';

// Mock ResizeObserver which is missing in JSDOM
class ResizeObserverMock {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}
window.ResizeObserver = ResizeObserverMock as any;

// Mock window.scrollTo
window.scrollTo = jest.fn();

// Mock framer-motion to bypass animation rendering cycles in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: ({ children, ...props }: any) => React.createElement('div', props, children),
      span: ({ children, ...props }: any) => React.createElement('span', props, children),
      button: ({ children, ...props }: any) => React.createElement('button', props, children),
      form: ({ children, ...props }: any) => React.createElement('form', props, children),
      section: ({ children, ...props }: any) => React.createElement('section', props, children),
      header: ({ children, ...props }: any) => React.createElement('header', props, children),
      footer: ({ children, ...props }: any) => React.createElement('footer', props, children),
    },
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock react-hot-toast globally
const mockToastFn = jest.fn();
(mockToastFn as any).success = jest.fn();
(mockToastFn as any).error = jest.fn();

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: mockToastFn,
}));
