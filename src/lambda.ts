import util from 'util';
import { APIGatewayProxyEvent } from './types';
import { handler as rpcHandler } from './handler';

export async function handler(event: APIGatewayProxyEvent) {
  try {
    const exec = /\/rpc\/(.+)/.exec(event.path);
    if (!exec) {
      throw new Error('Invalid url');
    }
    if (event.httpMethod !== 'POST') {
      throw new Error('Method must be POST');
    }
    let params: any[];
    if (!event.body) {
      throw new Error('Body required');
    }
    try {
      params = JSON.parse(event.body);
    } catch (e) {
      throw new Error('Invalid JSON');
    }
    if (!Array.isArray(params)) {
      throw new Error('Request body must be an array');
    }
    const ret = await rpcHandler(exec[1], params, event.headers['x-token']);
    return {
      statusCode: 200,
      body: JSON.stringify(ret),
    };
  } catch (e) {
    const serialized = util.inspect(e, { depth: null });
    console.error(serialized);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: e.message,
      }),
    };
  }
}
