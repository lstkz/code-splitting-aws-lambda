import { initialize } from 'defensive';

export const { createContract } = initialize({
  debug: process.env.NODE_ENV === 'development',
});
