import { ContractBinding } from 'defensive';

export function addRpcBinding() {
  ContractBinding.prototype.rpc = function(options) {
    this.fn.rpcOptions = {
      ...options,
      signature: options.signature || this.signature,
    };
    return this.fn as any;
  };
}

type RpcOptions = {
  public?: true;
  signature?: string;
};

declare module 'defensive' {
  interface ContractBinding<T> {
    rpcOptions?: RpcOptions;
    rpc(options: RpcOptions): T & ContractBinding<T>;
  }
}
