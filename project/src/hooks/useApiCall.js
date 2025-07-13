import { useRef, useCallback } from 'react';

// Request deduplication cache
const requestCache = new Map();

// Generate cache key for request
const getCacheKey = (url, method, data) => {
  return `${method}:${url}:${JSON.stringify(data || {})}`;
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

export const useApiCall = (delay = 300) => {
  const abortControllerRef = useRef(null);

  const makeApiCall = useCallback(async (apiFunction, ...args) => {
    // Cancel previous request if it's still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // For GET requests, check cache first
      if (apiFunction.name.includes('get') || apiFunction.name.includes('Get')) {
        const cacheKey = getCacheKey(args[0] || '', 'GET');
        const cached = requestCache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 5000) { // 5 second cache
          return cached.data;
        }
      }

      // Make the API call
      const result = await apiFunction(...args);

      // Cache GET requests
      if (apiFunction.name.includes('get') || apiFunction.name.includes('Get')) {
        const cacheKey = getCacheKey(args[0] || '', 'GET');
        requestCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return null;
      }
      throw error;
    }
  }, []);

  const debouncedApiCall = useCallback(
    debounce(makeApiCall, delay),
    [makeApiCall, delay]
  );

  const clearCache = useCallback(() => {
    requestCache.clear();
  }, []);

  return {
    makeApiCall,
    debouncedApiCall,
    clearCache,
    abort: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
  };
}; 