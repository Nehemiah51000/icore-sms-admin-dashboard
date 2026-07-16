import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from './api';

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry client errors (404, 403, 422, etc.) — retrying a
        // "you're not allowed" or "not found" response wastes time and
        // won't ever succeed. Do retry network failures / 5xx twice.
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Pages that render their own inline QueryErrorState mark their query
      // with meta: { silent: true } to avoid a duplicate toast on top of
      // the inline error box. Secondary/incidental queries (e.g. a provider
      // dropdown's data source inside a modal) rely on this toast instead
      // of bespoke inline error UI.
      if (query.meta?.silent) return;
      toast.error(
        getErrorMessage(error, "Couldn't load data. Please try again."),
      );
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      // Only acts as a safety net — most mutations already define their
      // own onError with field-level handling; this only fires for ones
      // that don't.
      if (mutation.options.onError) return;
      toast.error(getErrorMessage(error, 'Something went wrong.'));
    },
  }),
});
