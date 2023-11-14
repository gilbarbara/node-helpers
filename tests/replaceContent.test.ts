import { copyFile, mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';

import { SpyInstance, vi } from 'vitest';

import { replaceContent } from '../src/replaceContent';

const tempDirectory = resolve(__dirname, '.tmp');

describe('replaceContent', () => {
  let consoleLog: SpyInstance;

  beforeAll(async () => {
    await mkdir(tempDirectory, { recursive: true });
    await copyFile(
      resolve(__dirname, '__fixtures__/replaceContent.d.ts'),
      `${tempDirectory}/replaceContent.d.ts`,
    );

    consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLog.mockClear();
  });

  afterAll(async () => {
    await unlink(`${tempDirectory}/replaceContent.d.ts`);
    consoleLog.mockRestore();
  });

  it('should replace properly', async () => {
    const result = await replaceContent({
      directory: 'tests/.tmp',
      name: 'fix-cjs-dts',
      pattern: '**/*.d.ts',
      callback: content => {
        const { imp } = /(?<imp>import .+ from 'tree-changes';)/u.exec(content)?.groups ?? {};
        const { exp, named } =
          /(?<exp>export (?<named>.+) from 'tree-changes';)/u.exec(content)?.groups ?? {};
        const { exportDefault } =
          /(?<exportDefault>export \{ useTreeChanges as default \};)/u.exec(content)?.groups ?? {};

        if (imp) {
          const statement = `declare namespace UseTreeChanges {
  export ${named.replace('default as treeChanges', 'treeChanges')};

  ${exportDefault}
}

export = UseTreeChanges;`;

          return (
            content
              .replace(imp, `import ${named} from 'tree-changes';`)
              .replace(`\n${exp}`, '')
              .replace(`\n${exportDefault}`, '') + statement
          );
        }

        return false;
      },
    });

    expect(result).toMatchSnapshot();
    expect(consoleLog).toHaveBeenCalledWith('[fix-cjs-dts] ✓ tests/.tmp/replaceContent.d.ts');
  });

  it('should return an empty array if no files are found', async () => {
    const result = await replaceContent({
      directory: 'tests/.tmp',
      name: 'fix-cjs-dts',
      pattern: '**/*.json',
      callback: () => false,
    });

    expect(consoleLog).toHaveBeenCalledWith('[fix-cjs-dts] No files matched');
    expect(result).toEqual([]);
  });

  it('should skip if the callback is falsy', async () => {
    const result = await replaceContent({
      directory: 'tests/.tmp',
      name: 'fix-cjs-dts',
      pattern: '**/*.d.ts',
      callback: () => false,
    });

    expect(result).toEqual([]);
    expect(consoleLog).toHaveBeenCalledWith('[fix-cjs-dts] skip tests/.tmp/replaceContent.d.ts');
  });
});
