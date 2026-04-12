import { useEffect, useRef, DependencyList } from 'react';

/**
 * Hook para ejecutar una función async solo una vez al montar el componente
 * Previene la doble ejecución causada por React 18 Strict Mode
 * 
 * @param callback - Función async a ejecutar
 * @param deps - Dependencias opcionales (como en useEffect)
 * 
 * @example
 * // Sin dependencias - ejecuta solo una vez
 * useInitialize(async () => {
 *   const response = await fetch('/api/data');
 *   setData(response);
 * });
 * 
 * // Con dependencias - ejecuta cuando cambian
 * useInitialize(async () => {
 *   const response = await fetch(`/api/user/${userId}`);
 *   setUserData(response);
 * }, [userId]);
 */
export const useInitialize = (
  callback: () => Promise<void>,
  deps?: DependencyList
) => {
  const isInitialized = useRef(false);
  const depsRef = useRef<DependencyList | undefined>(deps);

  useEffect(() => {
    // Resetea el flag si las dependencias cambiaron
    const hasDepsChanged = deps && depsRef.current && 
      deps.length === depsRef.current.length &&
      deps.some((dep, idx) => dep !== depsRef.current?.[idx]);
    
    if (hasDepsChanged) {
      isInitialized.current = false;
    }
    depsRef.current = deps;

    if (!isInitialized.current) {
      isInitialized.current = true;
      callback().catch((error) => {
        console.error('Error in useInitialize:', error);
      });
    }
  }, deps ? deps : []);
};
