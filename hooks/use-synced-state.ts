"use client";

import { useState } from "react";

/**
 * Estado local inicializado pelas props do servidor que volta a sincronizar
 * quando elas mudam (ex.: após router.refresh()). Permite atualizações
 * otimistas sem useEffect.
 */
export function useSyncedState<T>(source: T) {
  const [value, setValue] = useState(source);
  const [previous, setPrevious] = useState(source);
  if (source !== previous) {
    setPrevious(source);
    setValue(source);
  }
  return [value, setValue] as const;
}
