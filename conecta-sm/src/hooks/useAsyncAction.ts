import { useState, useCallback } from 'react';

interface UseAsyncActionOptions<T, R> {
  onSuccess?: (result: R) => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

/**
 * Hook global para gerenciar o estado de operações assíncronas.
 * Evita cliques duplicados, gerencia loading, erros e sucessos.
 */
export function useAsyncAction<T = any, R = any>(
  actionFn: (args: T) => Promise<R>,
  options?: UseAsyncActionOptions<T, R>
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const execute = useCallback(
    async (args: T) => {
      if (isLoading) return; // Previne execuções duplicadas (double submit)
      
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      try {
        const result = await actionFn(args);
        setIsSuccess(true);
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Ocorreu um erro inesperado.');
        if (options?.onError) {
          options.onError(err);
        }
      } finally {
        setIsLoading(false);
        if (options?.onSettled) {
          options.onSettled();
        }
      }
    },
    [actionFn, isLoading, options]
  );

  return {
    execute,
    isLoading,
    error,
    isSuccess,
    setError, // Permite limpar o erro manualmente
  };
}
