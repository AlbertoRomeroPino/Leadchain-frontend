import { useEffect, useRef, type DependencyList } from 'react';

/**
 * Hook para ejecutar una función async solo UNA VEZ en el ciclo de vida del componente
 * 
 * Cuando NO hay deps: ejecuta solo en montaje inicial (similar a useEffect con [])
 * Cuando hay deps: ejecuta cuando las deps cambian (igual que useEffect)
 * 
 * Cancela automáticamente ejecuciones duplicadas de React 18 Strict Mode
 * 
 * @param callback - Función async a ejecutar
 * @param deps - Dependencias opcionales. Si no se pasan, ejecuta solo en montaje
 */
export const useInitialize = (
  callback: () => Promise<void>,
  deps?: DependencyList
) => {
  const hasRanRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Si ya ejecutamos y NO tenemos deps explícitas, no correr de nuevo
    // (comportamiento de useEffect con [] - ejecuta solo en montaje)
    if (hasRanRef.current && !deps) {
      return;
    }

    hasRanRef.current = true;

    // Cancelar requests anteriores
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Ejecutar el callback
    (async () => {
      try {
        await callback();
      } catch (error) {
        if (!signal.aborted) {
          console.error('Error in useInitialize:', error);
        }
      }
    })();

    // Cleanup
    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps ?? []);
};
