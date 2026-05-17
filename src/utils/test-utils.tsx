import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import citiesReducer from '@/store/citiesSlice';

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store,
    queryClient,
    ...renderOptions
  }: {
    preloadedState?: any;
    store?: any;
    queryClient?: QueryClient;
    [key: string]: any;
  } = {}
) {
  const finalStore =
    store ||
    configureStore({
      reducer: { cities: citiesReducer } as any,
      preloadedState,
    });

  const finalQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  function Wrapper({ children }: PropsWithChildren<{}>): React.JSX.Element {
    return (
      <Provider store={finalStore}>
        <QueryClientProvider client={finalQueryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store: finalStore,
    queryClient: finalQueryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
