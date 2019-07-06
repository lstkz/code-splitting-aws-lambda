import prettier from 'prettier';
import * as R from 'remeda';
import fs from 'fs';
import Path from 'path';
import { ContractBinding } from 'defensive';
import '../src/bindings/rpc';

const baseDir = Path.join(__dirname, '../src/contracts');

function walk(dir: string) {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = Path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(...walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

interface ContractInfo {
  file: string;
  key: string;
  binding: ContractBinding<any>;
}

const contracts: ContractInfo[] = R.flatMap(walk(baseDir), file => {
  const entries = Object.entries(require(file)) as Array<
    [string, ContractBinding<any>]
  >;
  return entries.map(([key, binding]) => ({
    file,
    key,
    binding,
  }));
});

const entries: string[] = [];

contracts
  .filter(item => item.binding.rpcOptions)
  .forEach(({ file, key, binding }) => {
    const relativePath = Path.relative(
      Path.join(__dirname, '../src'),
      file
    ).replace(/.ts$/, '');
    const signature = binding.rpcOptions!.signature;
    entries.push(
      `'${signature}': () => import(/* webpackChunkName: "${signature}"*/ './${relativePath}').then(x => x['${key}']),`
    );
  });

fs.writeFileSync(
  Path.join(__dirname, '../src/api-mapping.ts'),
  prettier.format(
    `
import { ContractBinding } from 'defensive';

type Fn = ContractBinding<any> & ((...args: any[]) => Promise<any>);
interface ApiMapping {
  [x: string]: () => Promise<Fn>
}
export const apiMapping: ApiMapping = {
${entries.join('\n')}
}
`,
    { ...require('../prettier.config'), parser: 'typescript' }
  )
);
