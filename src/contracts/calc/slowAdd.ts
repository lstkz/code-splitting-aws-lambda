import { V } from 'veni';
import { createContract } from '../../contract';

export const slowAdd = createContract('calc.slowAdd')
  .params('a', 'b')
  .schema({
    a: V.number()
      .min(0)
      .max(10),
    b: V.number()
      .min(0)
      .max(10),
  })
  .fn(async (a, b) => {
    return new Promise(resolve =>
      setTimeout(() => {
        resolve(a + b);
      }, 1000)
    );
  })
  .rpc({});
