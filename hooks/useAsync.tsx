import React, { useState, useEffect, useCallback } from "react";

enum STATUS {
  idle = 'idle',
  pending = 'pending',
  success = 'success',
  error = 'error',
}

// https://usehooks.com/useAsync/
export const useAsync = (asyncFunction, immediate = true) => {
  console.log(asyncFunction);
  const [status, setStatus] = useState<STATUS>(STATUS.idle);
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the below useEffect is not called
  // on every render, but only if asyncFunction changes.
  const execute = useCallback(() => {
    setStatus(STATUS.pending);
    setValue(null);
    setError(null);
    return asyncFunction()
      .then((response) => {
        setValue(response);
        setStatus(STATUS.success);
      })
      .catch((error) => {
        setError(error);
        setStatus(STATUS.error);
      });
  }, []);
  // Call execute if we want to fire it right away.
  // Otherwise execute can be called later, such as
  // in an onClick handler.
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);
  return { execute, status, value, error };
};