import { ContractBinding } from 'defensive';

type Fn = ContractBinding<any> & ((...args: any[]) => Promise<any>);
interface ApiMapping {
  [x: string]: () => Promise<Fn>;
}
export const apiMapping: ApiMapping = {
  'calc.add': () =>
    import(/* webpackChunkName: "calc.add"*/ './contracts/calc/add').then(
      x => x['add']
    ),
  'calc.slowAdd': () =>
    import(
      /* webpackChunkName: "calc.slowAdd"*/ './contracts/calc/slowAdd'
    ).then(x => x['slowAdd']),
};
