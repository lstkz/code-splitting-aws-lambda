import { initialize } from 'defensive';
import { addRpcBinding } from './bindings/rpc';

addRpcBinding();

export const { createContract } = initialize({
  debug: process.env.NODE_ENV === 'development',
});
