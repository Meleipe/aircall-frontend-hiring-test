import { useCallback } from 'react';

export const useLocalStorage = (keyName: string, defaultValue: any) => {
  const storedValue = () => {
    const value = window.localStorage.getItem(keyName);
    if (value) {
      return JSON.parse(value);
    } else {
      return defaultValue;
    }
  };

  const setStoredValue = useCallback(
    (value: any) => {
      if (value) {
        window.localStorage.setItem(keyName, JSON.stringify(value));
      } else {
        window.localStorage.removeItem(keyName);
      }
    },
    [keyName]
  );

  return [storedValue(), setStoredValue];
};
