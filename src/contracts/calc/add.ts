import { V } from 'veni';
import { createContract } from '../../contract';

export const add = createContract('calc.add')
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
    return a + b;
  })
  .rpc({
    public: true,
  });
