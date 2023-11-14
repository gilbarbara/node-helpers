# Node Helpers

Collection of useful functions for node.

## Usage

```bash
$ npm install @gilbarbara/node-helpers
```

## API

**replaceContent(options: ReplaceContentOptions): Promise<string[]>**  
Replace content in files.

<details>
  <summary>Type Definition</summary>

  ```typescript
type ReplaceActionResult = string | false | undefined;

interface ReplaceContentOptions {
  callback(content: string): Promise<ReplaceActionResult> | ReplaceActionResult;
  directory?: string;
  globOptions?: fg.Options;
  name?: string;
  pattern: fg.Pattern | fg.Pattern[];
  silent?: boolean;
}
  ```
</details>

<details>
  <summary>Example</summary>

  ```typescript
async function fixCjsDts() {
  const results = await replaceContent({
      directory: 'dist',
      name: 'fix-cjs-dts',
      pattern: '**/*.d.ts',
      callback: content => {
        const { exp, named } =
          /(?<exp>export (?<named>.+) from 'some-packages';)/u.exec(content)?.groups ?? {};
        const { exportDefault } =
          /(?<exportDefault>export \{ somePackage as default \};)/u.exec(content)?.groups ?? {};
        
        if (exp && named) {
        	const statement = `declare namespace SomePackage {
  export ${named.replace('default as somePackage', 'somePackage')};

  ${exportDefault}
}

export = SomePackage;`;

          return (
            content
              .replace(`\n${exp}`, '')
              .replace(`\n${exportDefault}`, '') + statement
          );
        }
        
        return false;
      }
  });
  
  // results is an array with the replace files content.
  console.log(result);
}
  ```
</details>
