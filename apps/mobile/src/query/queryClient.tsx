import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';

export const queryClient = new QueryClient();

export const withQueryClient = (app: () => JSX.Element) => {
  return () => (
    <QueryClientProvider client={queryClient}>{app()}</QueryClientProvider>
  );
};
