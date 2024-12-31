// Environment configuration for both browser and Node.js environments
const isBrowser = typeof window !== 'undefined';

const getEnvironmentVariables = () => {
  if (isBrowser) {
    // Browser environment - use Vite's import.meta.env
    return {
      GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
      API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3005',
      NODE_ENV: import.meta.env.MODE || 'development'
    };
  } else {
    // Node.js environment - use process.env
    return {
      GROQ_API_KEY: process.env.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY,
      API_URL: process.env.VITE_API_URL || process.env.API_URL || 'http://localhost:3005',
      NODE_ENV: process.env.NODE_ENV || 'development'
    };
  }
};

export const config = getEnvironmentVariables();

export const GROQ_API_KEY = config.GROQ_API_KEY;
export const API_URL = config.API_URL;
export const NODE_ENV = config.NODE_ENV;

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY not found in environment variables');
}
