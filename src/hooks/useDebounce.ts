import { useCallback, useRef } from "react";

export default function useDebounce(callback: () => any, delay: number) {
  const timer = useRef();

  const debouncedCallback = useCallback(
    (...args) => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      //@ts-expect-error
      timer.current = setTimeout(() => {
        //@ts-expect-error
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedCallback;
}
