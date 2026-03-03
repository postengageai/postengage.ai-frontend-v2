import { useState, useCallback } from 'react';

export interface UseCursorPaginationOptions {
  initialLimit?: number;
}

export interface CursorPaginationState {
  cursor?: string;
  limit: number;
  direction: 'forward' | 'backward';
  hasNext: boolean;
  hasPrev: boolean;
}

interface CursorPaginationResponse<T> {
  data: T[];
  pagination: {
    next_cursor?: string;
    previous_cursor?: string;
    has_next_page?: boolean;
    has_previous_page?: boolean;
  };
}

export function useCursorPagination(options: UseCursorPaginationOptions = {}) {
  const { initialLimit = 20 } = options;

  const [state, setState] = useState<CursorPaginationState>({
    limit: initialLimit,
    direction: 'forward',
    hasNext: false,
    hasPrev: false,
  });

  const goNext = useCallback((cursor?: string) => {
    setState(prev => ({
      ...prev,
      cursor,
      direction: 'forward',
    }));
  }, []);

  const goPrev = useCallback((cursor?: string) => {
    setState(prev => ({
      ...prev,
      cursor,
      direction: 'backward',
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      limit: initialLimit,
      direction: 'forward',
      hasNext: false,
      hasPrev: false,
    });
  }, [initialLimit]);

  const updateFromResponse = useCallback(
    <T>(response: CursorPaginationResponse<T>) => {
      setState(prev => ({
        ...prev,
        hasNext: response.pagination.has_next_page ?? false,
        hasPrev: response.pagination.has_previous_page ?? false,
      }));
    },
    []
  );

  const getPaginationParams = useCallback(() => {
    const params: Record<string, unknown> = {
      limit: state.limit,
    };

    if (state.cursor) {
      params[state.direction === 'forward' ? 'after' : 'before'] = state.cursor;
    }

    return params;
  }, [state.cursor, state.direction, state.limit]);

  return {
    paginationState: state,
    paginationParams: getPaginationParams(),
    goNext,
    goPrev,
    reset,
    updateFromResponse,
  };
}
