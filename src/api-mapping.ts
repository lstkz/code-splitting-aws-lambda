export const apiMapping = {
  'calc.add': import('./contracts/calc/add').then(x => x['add']),
  'calc.slowAdd': import('./contracts/calc/slowAdd').then(x => x['slowAdd']),
};
