import { useCallback, useEffect, useRef, useState } from 'react';

export function useApiData<T>(load: () => Promise<T>, key: string) {
  const loadRef = useRef(load);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  const reload = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadRef
      .current()
      .then((value) => {
        if (!active) {
          return;
        }
        setData(value);
        setError(null);
      })
      .catch((caught: unknown) => {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'No se pudo cargar la información');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [key, tick]);

  return { data, error, loading, reload };
}
