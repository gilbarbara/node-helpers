/* eslint-disable no-await-in-loop */
import { readFile, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

import fg from 'fast-glob';

export type ReplaceActionResult = string | false | undefined;

export interface ReplaceContentOptions {
  callback(content: string): Promise<ReplaceActionResult> | ReplaceActionResult;
  directory?: string;
  globOptions?: fg.Options;
  name?: string;
  pattern: fg.Pattern | fg.Pattern[];
  silent?: boolean;
}

export async function replaceContent(options: ReplaceContentOptions) {
  const {
    callback,
    directory = 'dist',
    globOptions = {},
    name = 'replaceContent',
    pattern,
    silent,
  } = options;
  const cwd = process.cwd();

  const files = await fg(pattern, {
    cwd: resolve(cwd, directory),
    ...globOptions,
    absolute: true,
    ignore: [...(globOptions.ignore || []), 'node_modules'],
  });

  const logger = (message: string) => {
    if (!silent) {
      // eslint-disable-next-line no-console
      console.log(`[${name}] ${message}`);
    }
  };

  if (!files.length) {
    logger('No files matched');
  }

  const output = [];

  for (const file of files) {
    const content = await readFile(file, 'utf8');
    const result = await callback(content);
    const filename = relative(cwd, file);

    if (result) {
      await writeFile(file, result);
      output.push(result);
      logger(`✓ ${filename}`);
    } else {
      logger(`skip ${filename}`);
    }
  }

  return output;
}
