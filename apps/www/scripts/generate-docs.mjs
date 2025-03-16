import * as OpenAPI from 'fumadocs-openapi';
import { rimrafSync } from 'rimraf';

const openapiOut = './content/docs/api';

// clean generated files
rimrafSync(openapiOut, {
  filter(v) {
    return !v.endsWith('index.mdx') && !v.endsWith('meta.json');
  },
});

void OpenAPI.generateFiles({
  // input files
  input: ['./openapi.yaml'],
  output: openapiOut,
  groupBy: 'tag',
});