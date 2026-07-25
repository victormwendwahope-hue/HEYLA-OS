import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiDataOptions<T> {
  fetchFn: () => Promise<T[]>;
  initialData?: T[];
  onError?: (error: Error) => void;
  toastError?: boolean;
}

export function useApiData<T>({ fetchFn, initialData = [], onError, toastError = true }: UseApiDataOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (toastError) {
        toast.error(error.message || 'Failed to fetch data');
      }
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onError, toastError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, setData, loading, error, refresh };
}
