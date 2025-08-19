/**
 * Utility to suppress non-critical development warnings
 * This helps reduce console noise during development
 */
export const suppressDevelopmentWarnings = () => {
  if (process.env.NODE_ENV === 'development') {
    // Suppress React Router future flag warnings
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Suppress React Router v7 warnings
        if (message.includes('React Router Future Flag Warning')) {
          return;
        }
        // Suppress React DevTools warnings
        if (message.includes('Download the React DevTools')) {
          return;
        }
        // Suppress other known non-critical warnings
        if (message.includes('validateDOMNesting')) {
          return;
        }
      }
      originalWarn.apply(console, args);
    };

    // Suppress React DevTools detection
    const originalError = console.error;
    console.error = (...args: any[]) => {
      const message = args[0];
      if (typeof message === 'string') {
        // Suppress React DevTools detection errors
        if (message.includes('React DevTools')) {
          return;
        }
      }
      originalError.apply(console, args);
    };
  }
};
